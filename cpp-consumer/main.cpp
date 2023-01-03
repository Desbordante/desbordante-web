#include <future>
#include <iostream>

#include <easylogging++.h>

#include "algorithms/options/all_options.h"
#include "db/db_manager.h"
#include "db/task_config.h"
#include "option/algo_options.h"
#include "task-processors/task_processor.h"

using namespace consumer;
namespace po = boost::program_options;

INITIALIZE_EASYLOGGINGPP

static DBManager::Config GetDBConfig() {
    return {.host = std::getenv("POSTGRES_HOST"),
            .port = std::getenv("POSTGRES_PORT"),
            .user = std::getenv("POSTGRES_USER"),
            .password = std::getenv("POSTGRES_PASSWORD"),
            .dbname = std::getenv("POSTGRES_DBNAME")};
}

enum class AnswerEnumType {
    TASK_SUCCESSFULLY_PROCESSED = 0,
    TASK_CRASHED_STATUS_UPDATED = 1,
    TASK_CRASHED_WITHOUT_STATUS_UPDATING = 2,
    TASK_NOT_FOUND = 3,
    PARSING_ARGS_ERROR = 4
};

AnswerEnumType ProcessMsg(po::variables_map&& options, DBManager const* manager) {
    LOG(DEBUG) << "TaskConfig create";
    auto task = std::make_unique<TaskConfig>(manager, std::move(options));
    if (!task->IsTaskValid()) {
        std::cout << "Task with ID = '" << task->GetTaskID()
                  << "' isn't valid. (Cancelled or not found)\n";
        return AnswerEnumType::TASK_NOT_FOUND;
    }
    std::unique_ptr<TaskProcessor> task_processor;
    try {
        LOG(DEBUG) << "TaskProcessor creating";
        task_processor = std::make_unique<TaskProcessor>(std::move(task));
        LOG(DEBUG) << "TaskProcessor created";
        task_processor->Execute();
        LOG(INFO) << "Task was successfully processed";
        return AnswerEnumType::TASK_SUCCESSFULLY_PROCESSED;
    } catch (const std::exception& e) {
        LOG(INFO) << "Unexpected behaviour in 'process_task()'.\n" << e.what();
        if (!task_processor) {
            LOG(INFO) << "TaskProcessor wasn't created";
            return AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING;
        }
        return AnswerEnumType::TASK_CRASHED_STATUS_UPDATED;
    }
}

int main(int argc, char* argv[]) {
    using namespace algos::config;
//    try {
        el::Loggers::configureFromGlobal("logging.conf");

        po::options_description all_options("TaskProcessor options");
        all_options.add(info_options)
                .add(general_options)
                .add(algo_options)
                .add(executor_options)
                .add(specific_algo_options);

        po::variables_map vm;

        try {
            po::store(po::parse_command_line(argc, argv, all_options), vm);
            if (vm.count(names::kHelp)) {
                std::cout << all_options << std::endl;
                return static_cast<int>(AnswerEnumType::PARSING_ARGS_ERROR);
            }

        } catch (po::error& e) {
            std::cout << e.what() << std::endl;
            return static_cast<int>(AnswerEnumType::PARSING_ARGS_ERROR);
        }
        try {
            po::notify(vm);
        } catch (po::error& e) {
            std::cout << e.what() << std::endl;
            return static_cast<int>(AnswerEnumType::PARSING_ARGS_ERROR);
        }
        auto manager = std::make_unique<DBManager>(GetDBConfig());
        return static_cast<int>(ProcessMsg(std::move(vm), manager.get()));
//    }
//    catch (const std::exception& e) {
//        std::cerr << "% Unexpected exception caught: " << e.what() << '\n';
//        return static_cast<int>(AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING);
//    }
}
