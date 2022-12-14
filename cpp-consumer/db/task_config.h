#pragma once
#include <enum.h>

#include <boost/algorithm/string.hpp>
#include <boost/program_options.hpp>
#include <filesystem>
#include <string>
#include <utility>

#include "field_wrapper.h"
#include "specific_db_manager.h"
#include "names_resolvers.h"

namespace consumer {

BETTER_ENUM(TaskMiningType, char, AR, CFD, FD, SpecificTypoCluster, TypoCluster, TypoFD, Stats)

BETTER_ENUM(BaseTablesType, char, state, config, fileinfo, fileformat)
BETTER_ENUM(SpecificTablesType, char, config, result)
BETTER_ENUM(SearchByAttr, char, fileID, taskID)

using DesbordanteDbManager =
        SpecificDbManager<BaseTablesType, std::pair<SpecificTablesType, TaskMiningType>,
                          SearchByAttr>;

class TaskConfig {
private:
    using ParamsMap = std::unordered_map<std::string, boost::any>;
    ParamsMap params_intersection_;
    std::shared_ptr<DesbordanteDbManager> db_manager_;

    template <typename MapSearchKey>
    void InsertParamsFromTable(MapSearchKey key);

    void InsertParam(std::pair<std::string, boost::any> param) {
        params_intersection_.emplace(std::move(param));
    }

    template <typename MapSearchKey>
    static void InsertAllParamsFromTable(MapSearchKey key,
                                         std::shared_ptr<DesbordanteDbManager>& db_manager,
                                         TaskConfig& config);

public:
    explicit TaskConfig(std::string task_id)
        : params_intersection_{{{"taskID", task_id}}}, db_manager_(nullptr) {}

    explicit TaskConfig(std::shared_ptr<DesbordanteDbManager> db_manager, std::string task_id);

    const ParamsMap& GetParamsIntersection() const;
    ParamsMap& GetParamsIntersection();

    template <typename T = std::string>
    const T& GetParam(std::string&& param) const {
        try {
            return boost::any_cast<const T&>(params_intersection_.at(param));
        } catch (const std::exception& error) {
            std::cerr << "Not found attr " << param << std::endl;
            std::cerr << error.what() << std::endl;
            throw error;
        }
    }

    TaskMiningType GetPreciseMiningType() const;

    static bool IsTaskValid(std::shared_ptr<DesbordanteDbManager>& manager, std::string task_id);
    bool IsTaskValid() const;

    template <typename TableMapKey>
    void UpdateParams(TableMapKey search_key, std::map<std::string, std::string>&& values) const {
        const auto& search_by = std::get<1>(db_manager_->GetTableInfo(search_key));
        db_manager_->SendUpdateQuery(search_key, std::move(values),
                                     GetParam((+search_by)._to_string()));
    }

    std::pair<SpecificTablesType, TaskMiningType> GetSpecificMapKey(
            SpecificTablesType table_type) const;

    const DesbordanteDbManager* GetDBManager() const {
        return db_manager_.get();
    }

    std::string GetAlgoName() const {
        return resolvers::ResolveAlgoName(GetParam<std::string>("algo_name"));
    }
};

}  // namespace consumer
