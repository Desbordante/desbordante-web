#include <future>
#include <iostream>
#include <string>
#include <vector>

#include "db/task_config.h"
#include "db/specific_db_manager.h"
#include "algorithms/options/names.h"

#include <easylogging++.h>

#include "task-processors/task_processor.h"

using namespace consumer;
namespace onam = algos::config::names;

INITIALIZE_EASYLOGGINGPP

static std::string DBConnection() {
    std::string host = std::getenv("POSTGRES_HOST");
    std::string port = std::getenv("POSTGRES_PORT");
    std::string user = std::getenv("POSTGRES_USER");
    std::string password = std::getenv("POSTGRES_PASSWORD");
    std::string dbname = std::getenv("POSTGRES_DBNAME");
    return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
}

static DesbordanteDbManager::BaseTables BaseTables() {
    std::string task_state_table = "\"TasksState\"";
    std::string file_info_table = "\"FilesInfo\"";
    std::string file_format_table = "\"FilesFormat\"";
    std::string task_config_table = "\"TasksConfig\"";
    return {
        {BaseTablesType::state,
         {task_state_table,
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<unsigned int>>("attemptNumber", "attempt_number"),
              std::make_shared<ExtendedAttribute<std::string>>("status", "status"),
              std::make_shared<ExtendedAttribute<std::string>>("phaseName", "phase_name"),
              std::make_shared<ExtendedAttribute<unsigned int>>("currentPhase", "current_phase"),
              std::make_shared<ExtendedAttribute<unsigned int>>("progress", "progress"),
              std::make_shared<ExtendedAttribute<unsigned int>>("maxPhase", "max_phase"),
              std::make_shared<ExtendedAttribute<std::string>>("errorMsg", "error_msg"),
              std::make_shared<ExtendedAttribute<bool>>("isExecuted", "is_executed"),
              std::make_shared<ExtendedAttribute<unsigned int>>("elapsedTime", "elapsed_time"),
          }}},
        {BaseTablesType::config,
         {task_config_table,
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("type", "type"),
              std::make_shared<ExtendedAttribute<std::string>>("algorithmName", "algo_name"),
              std::make_shared<ExtendedAttribute<std::string>>("fileID", "fileID"),
          }}},
        {BaseTablesType::fileinfo,
         {file_info_table,
          SearchByAttr::fileID,
          {
              std::make_shared<ExtendedAttribute<bool>>("hasHeader", onam::kHasHeader),
              std::make_shared<ExtendedAttribute<char>>("delimiter", onam::kSeparator),
              std::make_shared<ExtendedAttribute<std::filesystem::path>>("path", onam::kData),
              std::make_shared<CreateAttribute<bool>>(onam::kEqualNulls, true),
              std::make_shared<CreateAttribute<int>>(onam::kSeed, 0)
          }}},
        {BaseTablesType::fileformat,
         {file_format_table,
          SearchByAttr::fileID,
          {
              std::make_shared<ExtendedAttribute<algos::InputFormat>>(
                  "inputFormat", onam::kInputFormat),
              std::make_shared<ExtendedAttribute<unsigned>>(
                  std::string("tidColumnIndex"), std::string(onam::kTIdColumnIndex),
                  [](auto& i) { i--; },
                  [](const TaskConfig& task_config) {
                      return task_config.GetParam<algos::InputFormat>(onam::kInputFormat) ==
                          +algos::InputFormat::singular;
                  }),
              std::make_shared<ExtendedAttribute<unsigned>>(
                  "itemColumnIndex", onam::kItemColumnIndex, [](auto& i) { i--; },
                  [](const TaskConfig& task_config) {
                      return task_config.GetParam<algos::InputFormat>(onam::kInputFormat) ==
                          +algos::InputFormat::singular;
                  }),
              std::make_shared<ExtendedAttribute<bool>>(
                  "hasTid", onam::kFirstColumnTId,
                  [](const TaskConfig& task_config) {
                      return task_config.GetParam<algos::InputFormat>(onam::kInputFormat) ==
                          +algos::InputFormat::tabular;
                  }),
              }}}};
}

static DesbordanteDbManager::SpecificTables SpecificTables() {
    auto get_specific_config_table_name = [](const TaskMiningType& type) {
        return "\"" + std::string((+type)._to_string()) + "TasksConfig\"";
    };

    auto get_specific_result_table_name = [](const TaskMiningType& type) {
        return "\"" + std::string((+type)._to_string()) + "TasksResult\"";
    };
    return {
        {{SpecificTablesType::config, TaskMiningType::FD},
         {get_specific_config_table_name(TaskMiningType::FD),
          SearchByAttr::taskID,
          {std::make_shared<ExtendedAttribute<unsigned>>("maxLHS", onam::kMaximumLhs),
           std::make_shared<ExtendedAttribute<ushort>>("threadsCount", onam::kThreads),
           std::make_shared<ExtendedAttribute<double>>("errorThreshold", onam::kError)}}},
        {{SpecificTablesType::config, TaskMiningType::CFD},
         {get_specific_config_table_name(TaskMiningType::CFD),
          SearchByAttr::taskID,
          {std::make_shared<ExtendedAttribute<unsigned>>("maxLHS", onam::kMaximumLhs),
           std::make_shared<CreateAttribute<ushort>>(onam::kThreads, 1),
           std::make_shared<ExtendedAttribute<double>>("minSupportCFD", onam::kMinimumSupport),
           std::make_shared<ExtendedAttribute<double>>("minConfidence", onam::kMinimumConfidence)}}
        },
        {{SpecificTablesType::config, TaskMiningType::AR},
         {get_specific_config_table_name(TaskMiningType::AR),
          SearchByAttr::taskID,
          {std::make_shared<ExtendedAttribute<double>>("minSupportAR", onam::kMinimumSupport),
           std::make_shared<ExtendedAttribute<double>>("minConfidence", onam::kMinimumConfidence)}}},
        {{SpecificTablesType::config, TaskMiningType::TypoFD},
         {get_specific_config_table_name(TaskMiningType::TypoFD),
          SearchByAttr::taskID,
          {std::make_shared<ExtendedAttribute<unsigned>>("maxLHS", onam::kMaximumLhs),
              std::make_shared<ExtendedAttribute<ushort>>("threadsCount", onam::kThreads),
              std::make_shared<ExtendedAttribute<double>>("errorThreshold", onam::kError),
              std::make_shared<ExtendedAttribute<algos::PrimitiveType>>("preciseAlgorithm", onam::kPreciseAlgorithm),
              std::make_shared<ExtendedAttribute<algos::PrimitiveType>>("approximateAlgorithm", onam::kApproximateAlgorithm),
          }}},
        {{SpecificTablesType::config, TaskMiningType::TypoCluster},
         {get_specific_config_table_name(TaskMiningType::TypoCluster),
          SearchByAttr::taskID,
          {std::make_shared<ExtendedAttribute<std::string>>("typoFD", "typo_fd"),
              std::make_shared<ExtendedAttribute<std::string>>("parentTaskID", "typo_task_id"),
              std::make_shared<ExtendedAttribute<double>>("radius", onam::kRadius),
              std::make_shared<ExtendedAttribute<double>>("ratio", onam::kRatio),
          }}},
        {{SpecificTablesType::config, TaskMiningType::SpecificTypoCluster},
         {get_specific_config_table_name(TaskMiningType::SpecificTypoCluster),
          SearchByAttr::taskID,
          {std::make_shared<ExtendedAttribute<std::string>>("parentTaskID", "typo_cluster_task_id"),
              std::make_shared<ExtendedAttribute<unsigned int>>("clusterID", "cluster_id"),
          }}},
        {{SpecificTablesType::config, TaskMiningType::Stats},
         {get_specific_config_table_name(TaskMiningType::Stats), SearchByAttr::taskID,
         {std::make_shared<ExtendedAttribute<ushort>>("threadsCount", onam::kThreads)}}},
        {{SpecificTablesType::result, TaskMiningType::FD},
         {get_specific_result_table_name(TaskMiningType::FD),
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("PKColumnIndices", "pk"),
              std::make_shared<ExtendedAttribute<std::string>>("deps", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
              std::make_shared<ExtendedAttribute<std::string>>("withoutPatterns",
                                                               "chart_data_without_patterns"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::CFD},
         {get_specific_result_table_name(TaskMiningType::CFD),
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("PKColumnIndices", "pk"),
              std::make_shared<ExtendedAttribute<std::string>>("deps", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
              std::make_shared<ExtendedAttribute<std::string>>("withoutPatterns",
                                                               "chart_data_without_patterns"),
              std::make_shared<ExtendedAttribute<std::string>>("withPatterns",
                                                               "chart_data_with_patterns"),
              std::make_shared<ExtendedAttribute<std::string>>("valueDictionary", "value_dictionary"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::AR},
         {get_specific_result_table_name(TaskMiningType::AR),
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("deps", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
              std::make_shared<ExtendedAttribute<std::string>>("valueDictionary", "value_dictionary"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::TypoFD},
         {get_specific_result_table_name(TaskMiningType::TypoFD),
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("PKColumnIndices", "pk"),
              std::make_shared<ExtendedAttribute<std::string>>("deps", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::TypoCluster},
         {get_specific_result_table_name(TaskMiningType::TypoCluster),
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("TypoClusters", "typo_clusters"),
              std::make_shared<ExtendedAttribute<unsigned int>>("clustersCount", "clusters_count"),
              std::make_shared<ExtendedAttribute<std::string>>("suspiciousIndices", "suspicious_indices"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::SpecificTypoCluster},
         {get_specific_result_table_name(TaskMiningType::SpecificTypoCluster),
          SearchByAttr::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("suspiciousIndices", "suspicious_indices"),
              std::make_shared<ExtendedAttribute<std::string>>("squashedNotSortedCluster", "sq_not_sorted"),
              std::make_shared<ExtendedAttribute<std::string>>("squashedSortedCluster", "sq_sorted"),
              std::make_shared<ExtendedAttribute<std::string>>("notSquashedNotSortedCluster", "not_sq_not_sorted"),
              std::make_shared<ExtendedAttribute<std::string>>("notSquashedSortedCluster", "not_sq_sorted"),
              std::make_shared<ExtendedAttribute<unsigned int>>("notSquashedItemsAmount", "not_sq_amount"),
              std::make_shared<ExtendedAttribute<unsigned int>>("squashedItemsAmount", "sq_amount")
          }}}
    };
}

enum class AnswerEnumType {
    TASK_SUCCESSFULLY_PROCESSED = 0, TASK_CRASHED_STATUS_UPDATED = 1, TASK_CRASHED_WITHOUT_STATUS_UPDATING = 2,
    TASK_NOT_FOUND = 3
};

AnswerEnumType ProcessMsg(const std::string& task_id, std::shared_ptr<DesbordanteDbManager> manager) {
    if (!TaskConfig::IsTaskValid(manager, task_id)) {
        std::cout << "Task with ID = '" << task_id << "' isn't valid. (Cancelled or not found)\n";
        return AnswerEnumType::TASK_NOT_FOUND;
    }
    LOG(DEBUG) << "TaskConfig create";
    auto task = std::make_unique<TaskConfig>(manager, task_id);
    std::unique_ptr<TaskProcessor> task_processor;
    try {
        LOG(DEBUG) << "TaskProcessor creating";
        task_processor = std::make_unique<TaskProcessor>(std::move(task));
        LOG(DEBUG) << "TaskProcessor created";
        task_processor->Execute();
        return AnswerEnumType::TASK_SUCCESSFULLY_PROCESSED;
    } catch (const std::exception& e) {
        LOG(INFO) << "Unexpected behaviour in 'process_task()'.\n" << e.what();
        if (!task_processor) {
            LOG(INFO) << "TaskProcessor wasn't created";
            return AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING;
        }
        task_processor->GetConfig().UpdateParams(BaseTablesType::state,
                           {{"status", "INTERNAL_SERVER_ERROR"}, {"error_msg", e.what()}});
        return AnswerEnumType::TASK_CRASHED_STATUS_UPDATED;
    }
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        throw std::runtime_error("Expected 1 input argument [taskID]");
    }
    try {
        el::Loggers::configureFromGlobal("logging.conf");
        std::string task_id = argv[1];
        LOG(INFO) << "Create manager";
        auto manager = std::make_shared<DesbordanteDbManager>(DBConnection(), BaseTables(), SpecificTables());
        LOG(INFO) << "Manager created, process msg";
        return static_cast<int>(ProcessMsg(task_id, manager));
    } catch (const std::exception& e) {
        std::cerr << "% Unexpected exception caught: " << e.what() << '\n';
        return static_cast<int>(AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING);
    }
}
