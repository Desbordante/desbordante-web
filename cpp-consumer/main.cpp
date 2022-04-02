#include <future>
#include <iostream>
#include <string>
#include <vector>

#include "db/TaskConfig.h"
#include "db/SpecificDbManager.h"

#include <boost/algorithm/string.hpp>
#include <easylogging++.h>

#include "task-processors/TaskProcessor.h"

using namespace consumer;

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
          SearchBy::taskID,
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
          SearchBy::taskID,
          {
              std::make_shared<ExtendedAttribute<std::string>>("type", "type"),
              std::make_shared<ExtendedAttribute<std::string>>("algorithmName", "algo_name"),
              std::make_shared<ExtendedAttribute<std::string>>("fileID", "fileID"),
          }}},
        {BaseTablesType::fileinfo,
         {file_info_table,
          SearchBy::fileID,
          {
              std::make_shared<ExtendedAttribute<bool>>("hasHeader", "has_header"),
              std::make_shared<ExtendedAttribute<char>>("delimiter", "separator"),
              std::make_shared<ExtendedAttribute<std::filesystem::path>>("path", "data"),
          }}},
        {BaseTablesType::fileformat,
         {file_format_table,
          SearchBy::fileID,
          {
              std::make_shared<ExtendedAttribute<std::string>>(
                  "inputFormat", "input_format", [](std::string& value) { boost::to_lower(value); }),
              std::make_shared<ExtendedAttribute<unsigned>>(
                  std::string("tidColumnIndex"), std::string("tid_column_index"),
                  [](auto& i) { i--; },
                  [](const TaskConfig& task_config) {
                      return task_config.GetParam<std::string>("input_format") == "singular";
                  }),
              std::make_shared<ExtendedAttribute<unsigned>>(
                  "itemColumnIndex", "item_column_index", [](auto& i) { i--; },
                  [](const TaskConfig& task_config) {
                      return task_config.GetParam<std::string>("input_format") == "singular";
                  }),
              std::make_shared<ExtendedAttribute<bool>>("hasTid", "has_tid",
                                                        [](const TaskConfig& task_config) {
                                                            return task_config.GetParam<std::string>("input_format") ==
                                                                   "tabular";
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
          SearchBy::taskID,
          {std::make_shared<ExtendedAttribute<unsigned>>("maxLHS", "max_lhs"),
           std::make_shared<ExtendedAttribute<ushort>>("threadsCount", "threads"),
           std::make_shared<ExtendedAttribute<double>>("errorThreshold", "error"),
           std::make_shared<CreateAttribute<int>>("seed", 0),
           std::make_shared<CreateAttribute<bool>>("is_null_equal_null", true)}}},
        {{SpecificTablesType::config, TaskMiningType::AR},
         {get_specific_config_table_name(TaskMiningType::AR),
          SearchBy::taskID,
          {std::make_shared<ExtendedAttribute<double>>("minSupportAR", "minsup"),
           std::make_shared<ExtendedAttribute<double>>("minConfidence", "minconf")}}},
        {{SpecificTablesType::result, TaskMiningType::FD},
         {get_specific_result_table_name(TaskMiningType::FD),
          SearchBy::taskID,
          {
              std::make_shared<ExtendedAttribute<string>>("PKColumnIndices", "pk"),
              std::make_shared<ExtendedAttribute<string>>("FDs", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
              std::make_shared<ExtendedAttribute<string>>("withoutPatterns",
                                                          "chart_data_without_patterns"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::CFD},
         {get_specific_result_table_name(TaskMiningType::CFD),
          SearchBy::taskID,
          {
              std::make_shared<ExtendedAttribute<string>>("PKColumnIndices", "pk"),
              std::make_shared<ExtendedAttribute<string>>("CFDs", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
              std::make_shared<ExtendedAttribute<string>>("withoutPatterns",
                                                          "chart_data_without_patterns"),
              std::make_shared<ExtendedAttribute<string>>("withPatterns", "chart_data_with_patterns"),
          }}},
        {{SpecificTablesType::result, TaskMiningType::AR},
         {get_specific_result_table_name(TaskMiningType::AR),
          SearchBy::taskID,
          {
              std::make_shared<ExtendedAttribute<string>>("ARs", "deps"),
              std::make_shared<ExtendedAttribute<unsigned int>>("depsAmount", "deps_amount"),
              std::make_shared<ExtendedAttribute<string>>("valueDictionary", "value_dictionary"),
          }}}};
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
    auto task = std::make_unique<TaskConfig>(manager, task_id);
    try {
        TaskProcessor task_processor(std::move(task));
        task_processor.Execute();
        return AnswerEnumType::TASK_SUCCESSFULLY_PROCESSED;
    } catch (const std::exception& e) {
        std::cout << "Unexpected behaviour in 'process_task()'.\n" << e.what();
        task->UpdateParams(BaseTablesType::state,
                           {{"status", "INTERNAL_SERVER_ERROR"}, {"error_msg", e.what()}});
        return AnswerEnumType::TASK_CRASHED_STATUS_UPDATED;
    }
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        std::cerr << "Expected 1 input argument [taskID]" << '\n';
    }
    try {
        el::Loggers::configureFromGlobal("logging.conf");
        std::string task_id = argv[1];
        auto manager = std::make_shared<DesbordanteDbManager>(DBConnection(), BaseTables(), SpecificTables());
        return static_cast<int>(ProcessMsg(task_id, manager));
    } catch (const std::exception& e) {
        std::cerr << "% Unexpected exception caught: " << e.what() << '\n';
        return static_cast<int>(AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING);
    }
}