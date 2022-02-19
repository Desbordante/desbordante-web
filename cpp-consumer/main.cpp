#include <fstream>

#include "json.hpp"


#include "db/TaskConfig.h"
#include "db/DBManager.h"


#include "algorithms/Pyro.h"
#include "algorithms/TaneX.h"
#include "algorithms/FastFDs.h"
#include "algorithms/DFD/DFD.h"
#include "algorithms/Fd_mine.h"

#include "logging/easylogging++.h"
#include <boost/program_options.hpp>

#include <iostream>
#include <optional>
#include <string>
#include <vector>
#include <chrono>
#include <thread>
#include <future>

INITIALIZE_EASYLOGGINGPP

std::string TaskConfig::taskInfoTable = "\"TasksInfo\"";
std::string TaskConfig::fileInfoTable = "\"FilesInfo\"";
std::string TaskConfig::taskConfigTable = "\"TasksConfig\"";
std::string TaskConfig::FDTaskConfigTable = "\"FDTasksConfig\"";
//std::string TaskConfig::CFDTaskConfigTable = "\"CFDTasksConfig\"";
std::string TaskConfig::FDTaskResultTable = "\"FDTasksResult\"";
std::string TaskConfig::CFDTaskResultTable = "\"CFDTasksResult\"";


static std::string dbConnection() {
    std::string host = std::getenv("POSTGRES_HOST");
    std::string port = std::getenv("POSTGRES_PORT");
    std::string user = std::getenv("POSTGRES_USER");
    std::string password = std::getenv("POSTGRES_PASSWORD");
    std::string dbname = std::getenv("POSTGRES_DBNAME");

    return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
}

std::vector<std::string> generateRenamedColumns(std::vector<std::string> const &colNames, 
                                                bool hasHeader) {
    std::vector<std::string> renamedColNames;
    if (hasHeader) {
        for (auto colName : colNames) {
            if (colName[0] == '\"' && colName[colName.size()-1] == '\"') {
                colName = std::string(colName.begin() + 1, colName.end() - 1);
            }
            colName.erase(
                colName.begin(), 
                std::find_if(colName.begin(), colName.end(), 
                             [](unsigned char ch) { return !std::isspace(ch); })
            );
            if (colName.size() == 0) {
                colName = "empty";
            }
            TaskConfig::prepareString(colName);
            renamedColNames.push_back(colName);
        }
        // Vector contains information about how many times the given name occurs
        // (filling goes in ascending order of indices)
        // For example: { "col1", "col1", "col2", "col1", "col2"} 
        //           -> { 0,      1,      0,      2,      1     }
        std::vector<size_t> numberOfOccurrences(renamedColNames.size(), 0);
        for (size_t i = 1; i < renamedColNames.size(); ++i) {
            auto lastOccurenceIt = std::find(
                renamedColNames.rbegin() + (renamedColNames.size() - i),
                renamedColNames.rend(),
                renamedColNames[i]
            );
            if (lastOccurenceIt == renamedColNames.rend()) {
                continue;
            } else {
                size_t idx = renamedColNames.rend() - lastOccurenceIt - 1;
                numberOfOccurrences[i] = numberOfOccurrences[idx] + 1;
            }
        }
        for (size_t i = 1; i < renamedColNames.size(); ++i) {
            if (numberOfOccurrences[i] != 0) {
                renamedColNames[i] += "_" + std::to_string(numberOfOccurrences[i]);
            }
        }
    } else {
        for (size_t i = 0; i != colNames.size(); ++i) {
            renamedColNames.push_back(std::string("Attr " + std::to_string(i)));
        }
    }
    return renamedColNames;
}

void processTask(TaskConfig const& task, 
                               DBManager const& manager) {
    auto algName     = task.getAlgName();
    auto datasetPath = task.getDatasetPath();
    auto separator   = task.getSeparator();
    auto hasHeader   = task.getHasHeader();
    auto seed        = 0;
    auto error       = task.getErrorPercent();
    auto maxLhs      = task.getMaxLhs();
    auto parallelism = task.getParallelism();

    el::Loggers::configureFromGlobal("logging.conf");
    
    std::unique_ptr<FDAlgorithm> algInstance;

    std::cout << "Input: algorithm \"" << algName
              << "\" with seed " << std::to_string(seed)
              << ", error \"" << std::to_string(error)
              << ", maxLhs \"" << std::to_string(maxLhs)
              << "\" and dataset \"" << datasetPath
              << "\" with separator \'" << separator
              << "\'. Header is " << (hasHeader ? "" : "not ") << "present. " 
              << std::endl;

    
    if (algName == "Pyro") {
        algInstance = std::make_unique<Pyro>(datasetPath, separator, hasHeader, 
                                             seed, error, maxLhs, parallelism);
    } else if (algName == "TaneX") {
        algInstance = std::make_unique<Tane>(datasetPath, separator, hasHeader, 
                                             error, maxLhs);
    } else if (algName == "FastFDs") {
        algInstance = std::make_unique<FastFDs>(datasetPath, separator, hasHeader,
                                                maxLhs, parallelism);
    } else if (algName == "FD mine") {
        algInstance = std::make_unique<Fd_mine>(datasetPath, separator, hasHeader);
    } else if (algName == "DFD") {
        algInstance = std::make_unique<DFD>(datasetPath, separator, hasHeader,
                                            parallelism);
    }

    try {
        task.updateStatus(manager, "IN PROCESS");
        
        unsigned long long elapsedTime;
        const auto& phaseNames = algInstance->getPhaseNames();
        auto maxPhase = phaseNames.size();
        task.setMaxPhase(manager, maxPhase);
        task.updateProgress(manager, 0, phaseNames[0].data(), 1);

        auto executionThread = std::async(
            std::launch::async,
            [&elapsedTime, &algInstance]() -> void {
                elapsedTime = algInstance->execute();
            }
        );
        std::future_status status;
        do {
            status = executionThread.wait_for(std::chrono::seconds(0));
            if (status == std::future_status::ready) {
                std::cout << "Algorithm was executed" << std::endl;
                task.updateProgress(manager, 100, phaseNames[maxPhase-1].data(), maxPhase);
            } else if (status == std::future_status::timeout) {
                if (TaskConfig::isTaskCancelled(manager, task.getTaskID())) {
                    std::cout << "Task with ID = " << task.getTaskID() 
                              << " was cancelled." << std::endl;
                    break;
                }
                auto [cur_phase, phaseProgress] = algInstance->getProgress();
                task.updateProgress(manager, phaseProgress, 
                                    phaseNames[cur_phase].data(), cur_phase + 1);
            } else {
                throw std::runtime_error("Main thread: unknown future_status");
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
        } while (status != std::future_status::ready);

        if (!TaskConfig::isTaskCancelled(manager, task.getTaskID())) {
            task.setElapsedTime(manager, elapsedTime);
            auto PKColumnPositions = algInstance->getPKColumnPositions(
                                                  CSVParser(datasetPath, separator, hasHeader));
            task.updatePKColumnPositions(manager, PKColumnPositions);
            task.updateJsonDeps(manager, algInstance->getJsonFDs(false));
            task.updatePieChartData(manager, algInstance->getPieChartData());
            task.updateStatus(manager, "COMPLETED");
        } else {
            task.updateStatus(manager, "CANCELLED");
        }
        task.setIsExecuted(manager);
        return;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        throw e;
    }
}

void processMsg(std::string taskID,
                             DBManager const &manager) {
    if (!TaskConfig::isTaskExists(manager, taskID)) {
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

int main(int argc, char *argv[])
{   
    std::string taskId = argv[1];
    try {
        DBManager DBManager(dbConnection());
        processMsg(taskId, DBManager);
    } catch (const std::exception& e) {
        std::cerr << "% Unexpected exception caught: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
