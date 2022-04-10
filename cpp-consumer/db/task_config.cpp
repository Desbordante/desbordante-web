#include "task_config.h"

namespace consumer {

template <typename MapSearchKey>
void TaskConfig::InsertParamsFromTable(MapSearchKey key) {
    const auto& [table_name, search_by, extended_attrs] =
        db_manager_->GetTableInfo(key);
    std::vector<std::string> attrs;
    for (auto& item : extended_attrs) {
        if (!item->HasValue()) {
            attrs.emplace_back(item->GetDbAttrName());
        }
    }
    const auto& row = db_manager_->SendSelectQuery(key, attrs,
                                                   GetParam((+search_by)._to_string()))[0];
    for (auto& attr : extended_attrs) {
        if (!attr->IsNull(*this)) {
            if (attr->HasValue()) {
                params_intersection_.emplace(attr->GetConfigParam());
            } else {
                params_intersection_.emplace(attr->GetConfigParam(row));
            }
        }
    }
}

TaskConfig::TaskConfig(std::shared_ptr<DesbordanteDbManager> db_manager, std::string task_id)
    : params_intersection_{}, db_manager_(std::move(db_manager)) {
    params_intersection_.insert({"taskID", {task_id}});
    InsertParamsFromTable(BaseTablesType::config);
    InsertParamsFromTable(BaseTablesType::fileinfo);
    InsertParamsFromTable(GetSpecificMapKey(SpecificTablesType::config));
    if (GetPreciseMiningType() == +TaskMiningType::AR) {
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

TaskMiningType TaskConfig::GetPreciseMiningType() const {
    return TaskMiningType::_from_string_nocase(GetParam("type").c_str());
}


std::pair<SpecificTablesType, TaskMiningType> TaskConfig::GetSpecificMapKey(SpecificTablesType table_type) const {
    return { table_type, GetPreciseMiningType() };
}

}