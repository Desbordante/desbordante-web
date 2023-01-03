#pragma once

#include <enum.h>
#include <filesystem>
#include <string>
#include <utility>

#include <boost/algorithm/string.hpp>
#include <boost/program_options.hpp>

#include "../option/names.h"
#include "algorithms/algo_factory.h"
#include "db_manager.h"
#include "enums.h"
#include "names_resolvers.h"
#include "result_fields.h"

namespace consumer {

class TaskConfig {
private:
    using ParamsMap = boost::program_options::variables_map;
    ParamsMap params_intersection_;
    const DBManager* db_manager_;

public:
    TaskConfig(const DBManager* db_manager, ParamsMap&& options)
        : params_intersection_(std::move(options)), db_manager_(db_manager) {}

    const ParamsMap& GetParamsIntersection() const;
    ParamsMap& GetParamsIntersection();

    void PrintParams(std::ostream& out) const {
        for (const auto& [key, value] : GetParamsIntersection()) {
            out << key << std::endl;
        }
    }

    template <typename T = std::string>
    T GetParam(std::string&& param) const {
        try {
            return boost::any_cast<const T&>(params_intersection_.at(param).value());
        } catch (const std::exception& error) {
            std::cerr << "Not found attr " << param << std::endl;
            std::cerr << error.what() << std::endl;
            throw error;
        }
    }

    TaskMiningType GetPreciseMiningType() const;

    bool IsTaskValid() const;

    const DBManager* GetDBManager() const {
        return db_manager_;
    }

    std::string GetAlgoName() const {
        return resolvers::ResolveAlgoName(GetParam<std::string>(algos::config::names::kPrimitive));
    }

    std::string GetTaskID() const {
        return GetParam<std::string>(algos::config::names::kTaskID);
    }
    std::string GetFileID() const {
        return GetParam<std::string>(algos::config::names::kFileID);
    }

    std::string GetConfigTableName() const {
        return std::string((+GetPreciseMiningType())._to_string()) + "TasksConfig";
    }

    std::string GetResultTableName() const {
        return std::string((+GetPreciseMiningType())._to_string()) + "TasksResult";
    }
};

}  // namespace consumer
