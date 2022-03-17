#include <algorithm>
#include <cctype>
#include <filesystem>
#include <future>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

#include "db/TaskConfig.h"
#include "db/DBManager.h"

#include <boost/algorithm/string.hpp>
#include <boost/program_options.hpp>
#include <easylogging++.h>

#include "AlgoFactory.h"

namespace po = boost::program_options;

INITIALIZE_EASYLOGGINGPP

std::string TaskConfig::task_info_table = "\"TasksInfo\"";
std::string TaskConfig::file_info_table = "\"FilesInfo\"";
std::string TaskConfig::task_config_table = "\"TasksConfig\"";

const std::map<std::string, std::string> algo_name_resolution {
    {"Pyro", "pyro"}, {"Dep Miner", "depminer"}, {"TaneX", "tane"},
    {"FastFDs", "fastfds"}, {"FD mine", "fdmine"}, {"DFD", "dfd"}
};

static std::string DBConnection() {
   std::string host = std::getenv("POSTGRES_HOST");
   std::string port = std::getenv("POSTGRES_PORT");
   std::string user = std::getenv("POSTGRES_USER");
   std::string password = std::getenv("POSTGRES_PASSWORD");
   std::string dbname = std::getenv("POSTGRES_DBNAME");
    return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
}

std::string GetCompactFDs(std::list<FD> deps, bool with_null_lhs) {
    std::vector<std::string> compact_deps;
    for (auto& fd : deps) {
        if (with_null_lhs || fd.GetLhs().GetArity() != 0) {
            compact_deps.push_back(fd.ToCompactString());
        }
    }
    return boost::join(compact_deps, ";");
}

std::string GetPieChartData(std::list<FD> deps, int degree = 1) {
    std::map<unsigned int, double> lhs_values;
    std::map<unsigned int, double> rhs_values;

    for (const auto &fd : deps) {
        double divisor = std::pow(fd.GetLhs().GetArity(), degree);

        const auto &lhs_col_indices = fd.GetLhs().GetColumnIndices();
        for (size_t index = lhs_col_indices.find_first();
            index != boost::dynamic_bitset<>::npos;
            index = lhs_col_indices.find_next(index)) {
                lhs_values[index] += 1 / divisor;
        }
        size_t index = fd.GetRhs().GetIndex();

        rhs_values[index] = (divisor == 0)
                ? -1
                : rhs_values[index] + 1 / divisor;

    }

    auto GetCompactData = [](const std::map<unsigned int, double>& map) {
        std::vector<std::string> results;
        for (const auto& [key, value]: map) {
            results.emplace_back(std::to_string(key) + ',' + std::to_string(value));
        }
        return boost::join(results, ";");
    };
    const auto result = GetCompactData(lhs_values) + "|" + GetCompactData(rhs_values);

    return result;
}

void SaveFDTaskResult(TaskConfig const& task, DBManager const &manager, FDAlgorithm* algorithm) {
    auto key_cols = algorithm->GetKeys();
    std::vector<std::string> key_cols_indices;
    for (const auto* col : key_cols) {
        key_cols_indices.push_back(std::to_string(col->GetIndex()));
    }
    std::string pk_column_positions = boost::algorithm::join(key_cols_indices, ",");

    task.UpdatePKColumnPositions(manager, pk_column_positions);

    const auto& deps = algorithm->FdList();

    task.UpdateDeps(manager, GetCompactFDs(deps, false));
    task.UpdatePieChartData(manager, GetPieChartData(deps, 1));
    task.UpdateStatus(manager, "COMPLETED");
}

void SaveResultOfTheAlgorithm(TaskConfig const& task, DBManager const &manager, algos::Primitive* algorithm) {
    auto* fd_algorithm = dynamic_cast<FDAlgorithm*>(algorithm);
    if (fd_algorithm) {
        SaveFDTaskResult(task, manager, fd_algorithm);
    } else {
        throw new std::runtime_error("Not implemented yet");
    }
}

void processTask(TaskConfig const& task, DBManager const& manager) {
    const auto& params = task.GetParamsIntersection();
    const auto& algo = algo_name_resolution.at(task.GetAlgo());
    const auto primitive_type = boost::algorithm::to_lower_copy(task.GetType());
    el::Loggers::configureFromGlobal("logging.conf");
    std::unique_ptr<algos::Primitive> algorithm_instance =
        algos::CreateAlgorithmInstance(primitive_type, algo, params);
    try {
        task.UpdateStatus(manager, "IN PROCESS");

        unsigned long long elapsedTime;
        const auto& phase_names = algorithm_instance->GetPhaseNames();
        auto maxPhase = phase_names.size();
        task.SetMaxPhase(manager, maxPhase);
        task.UpdateProgress(manager, 0, phase_names[0].data(), 1);

        auto executionThread = std::async(
            std::launch::async,
            [&elapsedTime, &algorithm_instance]() -> void {
                elapsedTime = algorithm_instance->Execute();
            }
        );
        std::future_status status;
        do {
            status = executionThread.wait_for(std::chrono::seconds(0));
            if (status == std::future_status::ready) {
                std::cout << "Algorithm was executed" << std::endl;
                task.UpdateProgress(manager, 100, phase_names[maxPhase-1].data(), maxPhase);
            } else if (status == std::future_status::timeout) {
                auto [cur_phase, phaseProgress] = algorithm_instance->GetProgress();
                task.UpdateProgress(manager, phaseProgress,
                                    phase_names[cur_phase].data(), cur_phase + 1);
            } else {
                throw std::runtime_error("Main thread: unknown future_status");
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        } while (status != std::future_status::ready);

        if (TaskConfig::IsTaskValid(manager, task.GetTaskID())) {
            task.SetElapsedTime(manager, elapsedTime);
            SaveResultOfTheAlgorithm(task, manager, algorithm_instance.get());
        } else {
            task.UpdateStatus(manager, "CANCELLED");
        }
        task.SetIsExecuted(manager);
        return;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        throw e;
    }
}

void ProcessMsg(std::string taskID, DBManager const &manager) {
    if (!TaskConfig::IsTaskValid(manager, taskID)) {
        std::cout << "Task with ID = '" << taskID
                  << "' isn't valid. (Cancelled or not found)" << std::endl;
    } else {
        auto task = TaskConfig::GetTaskConfig(manager, taskID);
        try {
            processTask(task, manager);
            std::cout << "Task with ID = '" << taskID << "' was successfully processed."
                      << std::endl;
        } catch (const std::exception& e) {
            std::cout << "Unexpected behaviour in 'process_task()'. (Task wasn't committed)"
                      << std::endl;
            task.UpdateErrorStatus(manager, "SERVER ERROR", e.what());
        }
    }
}

int main(int argc, char *argv[]) {
    try {
        std::string task_id_ = argv[1];
        DBManager DBManager(DBConnection());
        ProcessMsg(task_id_, DBManager);
    } catch (const std::exception& e) {
        std::cerr << "% Unexpected exception caught: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}