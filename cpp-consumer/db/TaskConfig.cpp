#include "TaskConfig.h"
#include <easylogging++.h>

namespace consumer {

template <typename MapSearchKey>
void TaskConfig::InsertParamsFromTable(MapSearchKey key) {
    InsertAllParamsFromTable(key, db_manager_, *this);
}

template <typename MapSearchKey>
void TaskConfig::InsertAllParamsFromTable(MapSearchKey key, std::shared_ptr<DesbordanteDbManager>& db_manager,
                                          TaskConfig& config) {
    const auto& [table_name, search_by, extended_attrs] =
        db_manager->GetTableInfo(key);
    std::vector<std::string> attrs;
    for (auto& item : extended_attrs) {
        if (!item->HasValue()) {
            attrs.emplace_back(item->GetDbAttrName());
        }
    }
    const auto& row = db_manager->SendSelectQuery(key, attrs,config.GetParam((+search_by)._to_string()))[0];
    for (auto& attr : extended_attrs) {
        if (!attr->IsNull(config)) {
            if (attr->HasValue()) {
                config.InsertParam(attr->GetConfigParam());
            } else {
                config.InsertParam(attr->GetConfigParam(row));
            }
        }
    }
}

TaskConfig::TaskConfig(std::shared_ptr<DesbordanteDbManager> db_manager, std::string task_id)
    : params_intersection_{}, db_manager_(std::move(db_manager)) {
    params_intersection_.insert({"taskID", {task_id}});
    LOG(INFO) << "Insert info from base config";
    InsertParamsFromTable(BaseTablesType::config);
    LOG(INFO) << "Insert info from file info";
    InsertParamsFromTable(BaseTablesType::fileinfo);
    LOG(INFO) << "Insert info from specific config table";
    InsertParamsFromTable(GetSpecificMapKey(SpecificTablesType::config));
    LOG(INFO) << "Inserted info from specific table";
    if (GetPreciseMiningType() == +TaskMiningType::SpecificTypoCluster) {
        LOG(INFO) << "Insert info for typo cluster";
        TaskConfig temp_config{GetParam("typo_cluster_task_id")};
        LOG(INFO) << "Temp config created";
        InsertAllParamsFromTable(std::make_pair(SpecificTablesType::config,
                                                TaskMiningType::TypoCluster),
                                 db_manager_, temp_config);
        InsertAllParamsFromTable(std::make_pair(SpecificTablesType::result,
                                                TaskMiningType::TypoCluster),
                                 db_manager_, temp_config);
        this->params_intersection_.merge(temp_config.GetParamsIntersection());
    }
    if (GetPreciseMiningType() == +TaskMiningType::TypoCluster ||
        GetPreciseMiningType() == +TaskMiningType::SpecificTypoCluster) {
        LOG(INFO) << "Insert info for typo cluster";
        TaskConfig temp_config{GetParam("typo_task_id")};
        LOG(INFO) << "Temp config created";
        InsertAllParamsFromTable(std::make_pair(SpecificTablesType::config, TaskMiningType::TypoFD),
                                 db_manager_, temp_config);
        LOG(INFO) << "Inserted params from typo cluster config";
        this->params_intersection_.merge(temp_config.GetParamsIntersection());
    }
    if (GetPreciseMiningType() == +TaskMiningType::AR) {
        LOG(DEBUG) << "Insert info for AR task (fileformat)";
        InsertParamsFromTable(BaseTablesType::fileformat);
    }
}

bool TaskConfig::IsTaskValid(std::shared_ptr<DesbordanteDbManager>& manager, std::string task_id) {
    try {
        auto result = manager->SendSelectQuery(BaseTablesType::state, {}, std::move(task_id),
                                               {{"deletedAt", "IS NULL"}});
        return result.size() == 1;
    } catch (const std::exception& e) {
        return false;
    }
}

bool TaskConfig::IsTaskValid() const {
    try {
        auto result = db_manager_->SendSelectQuery(BaseTablesType::state, {}, GetParam("taskID"),
                                                   {{"deletedAt", "IS NULL"}});
        return result.size() == 1;
    } catch (const std::exception& e) {
        return false;
    }
}

const TaskConfig::ParamsMap& TaskConfig::GetParamsIntersection() const {
    return params_intersection_;
}

TaskConfig::ParamsMap& TaskConfig::GetParamsIntersection() {
    return params_intersection_;
}

TaskMiningType TaskConfig::GetPreciseMiningType() const {
    return TaskMiningType::_from_string_nocase(GetParam("type").c_str());
}


std::pair<SpecificTablesType, TaskMiningType> TaskConfig::GetSpecificMapKey(SpecificTablesType table_type) const {
    return { table_type, GetPreciseMiningType() };
}

}