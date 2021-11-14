
#include <algorithm>
#include <cctype>
#include <filesystem>
#include <iostream>
#include <optional>
#include <string>
#include <vector>
#include <chrono>
#include <thread>
#include <future>

#include <boost/program_options.hpp>

#include "logging/easylogging++.h"

#include "algorithms/Pyro.h"
#include "algorithms/TaneX.h"
#include "algorithms/FastFDs.h"
#include "algorithms/DFD/DFD.h"
#include "algorithms/Fd_mine.h"

#include "TaskConsumer.h"

INITIALIZE_EASYLOGGINGPP

std::string TaskConfig::tableName = "tasks";

void TaskConsumer::processMsg(nlohmann::json payload,
                             DBManager const &manager) const {
    auto taskID = std::string(payload["taskID"]);
    if (!TaskConfig::taskExists(manager, taskID)) {
        std::cout << "Task with ID = '" << taskID
                  << "' isn't in the database. (Task wasn't processed (skipped))"
                  << std::endl;
    } else {
        auto task = TaskConfig::getTaskConfig(manager, taskID);
        if (TaskConfig::isTaskCancelled(manager, taskID)) {
            std::cout << "Task with ID = '" << taskID
                      << "' was cancelled." << std::endl;
        } else {
            task.writeInfo(std::cout);
            try {
                processTask(task, manager);
            } catch (const std::exception& e) {
                std::cout << "Unexpected behaviour in 'process_task()'. (Task wasn't commited)"
                        << std::endl;
                task.updateErrorStatus(manager, "SERVER ERROR", e.what());
                return;
            }
            std::cout << "Task with ID = '" << taskID
                    << "' was successfully processed." << std::endl;
        }
    }
}

void TaskConsumer::processTask(TaskConfig const& task, 
                               DBManager const& manager) const {
    auto algName = task.getAlgName();
    auto datasetPath = task.getDatasetPath();
    auto separator = task.getSeparator();
    auto hasHeader = task.getHasHeader();
    auto error = task.getErrorPercent();
    auto maxLHS = task.getMaxLHS();
    
    auto seed = 0;
    unsigned int parallelism = task.getParallelism();

    el::Loggers::configureFromGlobal("logging.conf");
    
    std::unique_ptr<FDAlgorithm> algorithmInstance;

    std::cout << "Input: algorithm \"" << algName
              << "\" with seed " << std::to_string(seed)
              << ", error \"" << std::to_string(error)
              << ", maxLHS \"" << std::to_string(maxLHS)
              << "\" and dataset \"" << datasetPath
              << "\" with separator \'" << separator
              << "\'. Header is " << (hasHeader ? "" : "not ") << "present. " 
              << std::endl;

    if (algName == "Pyro") {
        algorithmInstance = std::make_unique<Pyro>(datasetPath, separator, 
                            hasHeader, seed, error, maxLHS, parallelism);
    } else if (algName == "TaneX") {
        algorithmInstance = std::make_unique<Tane>(datasetPath, separator, 
                            hasHeader, error, maxLHS);
    } else if (algName == "FastFDs") {
        algorithmInstance = std::make_unique<FastFDs>(datasetPath, separator, hasHeader);
    } else if (algName == "FD mine") {
        algorithmInstance = std::make_unique<Fd_mine>(datasetPath, separator, hasHeader);
    } else if (algName == "DFD") {
        algorithmInstance = std::make_unique<DFD>(datasetPath, separator, hasHeader);
    }

    try {
        task.updateStatus(manager, "IN PROCESS");
        
        unsigned long long elapsedTime;

        const auto& phaseNames = algorithmInstance->getPhaseNames();
        auto maxPhase = phaseNames.size();
        task.setMaxPhase(manager, maxPhase);
        task.updateProgress(manager, 0, phaseNames[0].data(), 1);

        auto executionThread = std::async(
            std::launch::async,
            [&elapsedTime, &algorithmInstance]() -> void {
                elapsedTime = algorithmInstance->execute();
            }
        );
        std::future_status status;
        do {
            status = executionThread.wait_for(std::chrono::seconds(0));

            if (status == std::future_status::ready) {
                std::cout << "Algorithm was executed" << std::endl;
                task.updateProgress(manager, 100, phaseNames[maxPhase-1].data(), maxPhase);
                break;
            } else if (status == std::future_status::timeout) {
                if (TaskConfig::isTaskCancelled(manager, task.getTaskID())) {
                    std::cout << "Task with ID = " << task.getTaskID() 
                              << " was cancelled." << std::endl;
                    break;
                }
                auto [cur_phase, phaseProgress] = algorithmInstance->getProgress();
                task.updateProgress(manager, phaseProgress, 
                                    phaseNames[cur_phase].data(), cur_phase + 1);
            } else {
                throw std::runtime_error("Main thread: unknown future_status");
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        } while (status != std::future_status::ready);

        if (!TaskConfig::isTaskCancelled(manager, task.getTaskID())) {
            task.setElapsedTime(manager, elapsedTime);
            task.updateJsonFDs(manager, algorithmInstance->getJsonFDs(false));
            task.updateJsonArrayNameValue(manager, algorithmInstance->getJsonArrayNameValue());
            task.updateJsonColumnNames(manager, algorithmInstance->getJsonColumnNames());
            task.updateStatus(manager, "COMPLETED");
        } else {
            task.updateStatus(manager, "CANCELLED");
        }
        return;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        throw e;
    }
    throw std::runtime_error("Unexpected behavior during task executing");
}