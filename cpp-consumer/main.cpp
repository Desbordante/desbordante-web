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

std::string TaskConfig::task_state_table = "\"TasksState\"";
std::string TaskConfig::file_info_table = "\"FilesInfo\"";
std::string TaskConfig::file_format_table = "\"FilesFormat\"";
std::string TaskConfig::task_config_table = "\"TasksConfig\"";

const std::map<std::string, std::string> algo_name_resolution {
    {"Pyro", "pyro"}, {"Dep Miner", "depminer"}, {"TaneX", "tane"},
    {"FastFDs", "fastfds"}, {"FD mine", "fdmine"}, {"DFD", "dfd"},
    {"FDep", "fdep"}, { "Apriori", "apriori" },
    {"Typo Miner", "typo"}, {"Typo Cluster Miner", "typo"}
};

static std::string DBConnection() {
    std::string host = std::getenv("POSTGRES_HOST");
    std::string port = std::getenv("POSTGRES_PORT");
    std::string user = std::getenv("POSTGRES_USER");
    std::string password = std::getenv("POSTGRES_PASSWORD");
    std::string dbname = std::getenv("POSTGRES_DBNAME");
    return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
}

std::string GetCompactFDs(const std::list<FD>& deps, bool with_null_lhs) {
    std::vector<std::string> compact_deps;
    for (const auto& fd : deps) {
        if (with_null_lhs || fd.GetLhs().GetArity() != 0) {
            compact_deps.push_back(fd.ToCompactString());
        }
    }
    return boost::join(compact_deps, ";");
}

std::string GetCompactARs(const std::list<model::ArIDs>& deps) {
    std::vector<std::string> compact_deps;
    for (auto& ar : deps) {
        std::cout << ar.ToCompactString() << std::endl;
        compact_deps.push_back(ar.ToCompactString());
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
}

void SaveARTaskResult(TaskConfig const& task, DBManager const &manager, algos::ARAlgorithm* algorithm) {
    const auto& deps = algorithm->GetItemNamesVector();
    task.UpdateValueDictionary(manager, boost::join(deps, ","));

    const auto& ar_list = algorithm->GetArIDsList();
    task.UpdateDeps(manager, GetCompactARs(ar_list));
}

void SaveResultOfTheAlgorithm(TaskConfig const& task, DBManager const &manager, algos::Primitive* algorithm) {
    auto* fd_algorithm = dynamic_cast<FDAlgorithm*>(algorithm);
    if (fd_algorithm) {
        SaveFDTaskResult(task, manager, fd_algorithm);
        task.UpdateStatus(manager, "COMPLETED");
        return;
    }
    auto* ar_algorithm = dynamic_cast<algos::ARAlgorithm*>(algorithm);
    if (ar_algorithm) {
        SaveARTaskResult(task, manager, ar_algorithm);
        task.UpdateStatus(manager, "COMPLETED");
        return;
    } else {
        throw new std::runtime_error("Not implemented yet");
    }
}

void ProcessTask(TaskConfig const& task, DBManager const& manager) {
    const auto& params = task.GetParamsIntersection();
    const auto& algo = algo_name_resolution.at(task.GetAlgo());
    const auto primitive_type = boost::algorithm::to_lower_copy(task.GetType());
    el::Loggers::configureFromGlobal("logging.conf");
    std::cout << "Creating algorithm instance\n";
    std::unique_ptr<algos::Primitive> algorithm_instance =
        algos::CreateAlgorithmInstance(primitive_type, algo, params);
    std::cout << "Algorithm was created\n";
    try {
        task.UpdateStatus(manager, "IN_PROCESS");
        auto phase_names = algorithm_instance->GetPhaseNames();
        bool alg_has_progress = phase_names.size() != 0;
        unsigned long long elapsedTime;
        auto maxPhase = phase_names.size();
        if (alg_has_progress) {
            task.SetMaxPhase(manager, maxPhase);
            task.UpdateProgress(manager, 0, phase_names[0].data(), 1);
        } else {
            phase_names = { task.GetType() + "s mining" };
            maxPhase = 1;
        }
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
        }
        task.SetIsExecuted(manager);
        return;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        throw e;
    }
}

enum class AnswerEnumType {
    TASK_SUCCESSFULLY_PROCESSED = 0, TASK_CRASHED_STATUS_UPDATED = 1, TASK_CRASHED_WITHOUT_STATUS_UPDATING = 2,
    TASK_NOT_FOUND = 3
};

AnswerEnumType ProcessMsg(std::string taskID, DBManager const &manager) {
    if (!TaskConfig::IsTaskValid(manager, taskID)) {
        std::cout << "Task with ID = '" << taskID << "' isn't valid. (Cancelled or not found)\n";
        return AnswerEnumType::TASK_NOT_FOUND;
    }
    TaskConfig task = TaskConfig::GetTaskConfig(manager, taskID);
    try {
        ProcessTask(task, manager);
        std::cout << "Task with ID = '" << taskID << "' was successfully processed.\n";
        return AnswerEnumType::TASK_SUCCESSFULLY_PROCESSED;
    } catch (const std::exception& e) {
        std::cout << "Unexpected behaviour in 'process_task()'.\n" << e.what();
        task.UpdateErrorStatus(manager, "INTERNAL_SERVER_ERROR", e.what());
        return AnswerEnumType::TASK_CRASHED_STATUS_UPDATED;
    }
}

int main(int argc, char *argv[]) {
    std::string task_id_ = argv[1];
    try {
        DBManager manager(DBConnection());
        return (int)ProcessMsg(task_id_, manager);
    } catch (const std::exception& e) {
        std::cerr << "% Unexpected exception caught: " << e.what() << std::endl;
        return (int)AnswerEnumType::TASK_CRASHED_WITHOUT_STATUS_UPDATING;
    }
    return 0;
}