#pragma once
#include <string>
#include <algorithm>

#include "json.hpp"
#include "DBManager.h"

class TaskConfig{
    std::string const taskID;
    std::string const algName;
    std::string const type; // "FD", "CFD",
    double const errorPercent;
    char const separator;
    std::string const fileID;
    std::string const datasetPath;
    bool const hasHeader;
    unsigned int const maxLHS;
    unsigned int const parallelism;

    static std::string taskInfoTable;
    //      taskID, attemptNumber, type, status, phaseName, currentPhase, 
    //      progress, maxPhase, errorMsg, elapsedTime, deletedAt
    static std::string fileInfoTable;
    //      ID, isBuiltInDataset, hasHeader, rows, path, delimiter
    static std::string taskConfigTable;
    //      fileID, taskID, algorithmName,
    static std::string FDTaskConfigTable;
    //      errorThreshold, maxLHS, threadsCount;
    // static std::string CFDTaskConfigTable;
    //      maxLHS, minSupport, minConfidence
    static std::string FDTaskResultTable;
    //      taskID, PKColumnIndices, FDs, PieChartData
    static std::string CFDTaskResultTable;
    //      taskID, PKColumnIndices, CFDs, PieChartData

    TaskConfig(std::string taskID, std::string type, std::string algName, 
               double errorPercent, char separator, 
               std::string fileID, std::string datasetPath, bool hasHeader, 
               unsigned int maxLHS, unsigned int parallelism)
        :   taskID(taskID), type(type), algName(algName), 
            errorPercent(errorPercent), separator(separator), fileID(fileID),
            datasetPath(datasetPath), 
            hasHeader(hasHeader), maxLHS(maxLHS), parallelism(parallelism) { }
public:

    auto getAlgName()      const { return algName;      }
    auto getTaskID()       const { return taskID;       }
    auto getErrorPercent() const { return errorPercent; }
    auto getSeparator()    const { return separator;    }
    auto getDatasetPath()  const { return datasetPath;  }
    auto getHasHeader()    const { return hasHeader;    }
    auto getMaxLhs()       const { return maxLHS;       }
    auto getParallelism()  const { return parallelism;  }

    auto& writeInfo(std::ostream& os) const {
        os << "Task Config:\n"
           << "ID -- " << taskID
           << ", algorithm name -- " << algName
           << ", error percent -- " << errorPercent
           << ", datasetPath -- " << datasetPath
           << ", separator -- '" << separator << "'"
           << ", hasHeader -- " << hasHeader
           << ", maxLHS -- " << maxLHS
           << ".\n";
        return os;
    }

    static void prepareString(std::string& str) {
        for(
            auto pos = std::find(str.begin(), str.end(), '\''); 
            pos != str.end(); 
            pos = std::find(pos, str.end(), '\'')
        ) {
            pos = str.insert(pos + 1, '\'');
            pos++;
        }
    }

    static bool isTaskExists(DBManager const &manager, std::string taskID) {
        std::string query = "SELECT * FROM " + taskInfoTable + 
                            " WHERE \"taskID\" = '" + taskID + "'";
        auto answer = manager.defaultQuery(query);
        return answer.size() == 1;
    }

    static bool isTaskCancelled(DBManager const &manager, std::string taskID) {
        std::string query = "SELECT * FROM " + taskInfoTable +
                            " WHERE \"deletedAt\" IS NULL"
                            " AND \"taskID\" = '" + taskID + "'";
        auto answer = manager.defaultQuery(query);
        return answer.size() == 0;
    }

    static TaskConfig getTaskConfig(DBManager const &manager, std::string taskID) {
        std::string postfix = " WHERE \"taskID\" = '" + taskID + "'";
        std::string query = "SELECT \"type\" from " + taskConfigTable + postfix;
        auto rows = manager.defaultQuery(query);
        std::string type = rows[0]["\"type\""].c_str();
        
        query = "SELECT \"algorithmName\", \"fileID\" FROM " + taskConfigTable + postfix;
        rows = manager.defaultQuery(query);
        std::string algorithmName = rows[0]["\"algorithmName\""].c_str();
        std::string fileID = rows[0]["\"fileID\""].c_str();

        query = "SELECT \"hasHeader\", \"path\", \"delimiter\" FROM " + fileInfoTable 
              + " WHERE \"ID\" = '" + fileID + "'";
        rows = manager.defaultQuery(query);
        char delimiter = rows[0]["\"delimiter\""].c_str()[0];
        std::string path = rows[0]["\"path\""].c_str();
        bool hasHeader;
        rows[0]["\"hasHeader\""] >> hasHeader;
        
        query = "SELECT \"errorThreshold\", \"maxLHS\", \"threadsCount\" FROM " + FDTaskConfigTable + postfix;
        rows = manager.defaultQuery(query);
        auto errorThreshold = std::stod(rows[0]["\"errorThreshold\""].c_str());
        auto maxLHS       = (unsigned int)std::stoi(rows[0]["\"maxLHS\""].c_str());
        auto threadsCount = (unsigned int)std::stoi(rows[0]["\"threadsCount\""].c_str());
        return TaskConfig(taskID, type, algorithmName, errorThreshold, delimiter,
                          fileID, path, hasHeader, maxLHS, threadsCount);
    }

    // Send a request to DB for status updating
    void updateStatus(DBManager const &manager, std::string status) const {
        try {
            prepareString(status);
            std::string query = "UPDATE " + taskInfoTable + " SET \"status\" = "
                                "'" + status + "' WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with changing task's status in DB) "
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    void setMaxPhase(DBManager const& manager, size_t maxPhase) const {
        try {
            std::string query = "UPDATE " + taskInfoTable + " SET \"maxPhase\" = "
                + std::to_string(maxPhase) + " WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with changing maxPhase in DB) "
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    // Send a request to DB for progress updating
    void updateProgress(DBManager const &manager, double progressPercent, 
        std::string const &phaseName = "", size_t curPhase = 0) const {
        try {
            std::string query = "UPDATE " + taskInfoTable + " SET \"progress\" = " 
                + std::to_string(progressPercent);
            if (phaseName.length()) {
                query += ", \"phaseName\" = '" + phaseName + "'";
            }
            if (curPhase != 0) {
                query += ", \"currentPhase\" = " + std::to_string(curPhase);
            }
            query += " WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with changing task's progress in DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }
    
    // Send a request to DB with JSON array of primary key column positions
    void updatePKColumnPositions(DBManager const &manager, 
                                 std::vector<std::size_t> const &positions) const{
        try {
            auto PKColumnPositions = nlohmann::json(positions).dump();
            auto tableName = (type == "FD" ? FDTaskResultTable : CFDTaskResultTable);
            std::string query = "UPDATE " + tableName 
                    + " SET \"PKColumnIndices\" = '" + PKColumnPositions + "'"
                    + " WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with updating PK column positions in DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }

    void setIsExecuted(DBManager const& manager) const {
        try {
            std::string query = "UPDATE " + taskInfoTable + " SET "
                              + " \"isExecuted\" = true"
                              + " WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with updating isExecuted attr in DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }

    // Send a request to DB with a set of FDs
    void updateJsonDeps(DBManager const& manager, const std::string& deps) const {
        try {
            std::string tableName = (type == "FD" ? FDTaskResultTable : CFDTaskResultTable);
            std::string depsName = (type == "FD" ? "\"FDs\"" : "\"CFDs\"");
            std::string query = "UPDATE " + tableName + " SET " 
                              + depsName + " = '" + deps + "'"
                              + " WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with updating task's FDs in DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }

    // Send a request to DB with JSON array (data for pie chart for client)
    void updatePieChartData(DBManager const& manager, const std::string& pieChartData) const {
        try {
            auto tableName = (type == "FD" ? FDTaskResultTable : CFDTaskResultTable);
            std::string query = "UPDATE " + tableName  + " SET \"pieChartData\" = '"
                                + pieChartData + "' WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with sending data to DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }

    // Send a request to DB for changing task's status to 'ERROR' 
    // and update errorStatus;
    void updateErrorStatus(DBManager const& manager, std::string error, 
                           std::string errorMsg) const {
        try {
            prepareString(error);
            prepareString(errorMsg);
            std::string query = "UPDATE " + taskInfoTable + " SET \"status\" = "
                                + "'" + error + "', \"errorMsg\" = '" + errorMsg
                                + "' WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with changing task's error status in DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }

    void setElapsedTime(DBManager const& manager, unsigned long long time) const {
        try {
            std::string query = "UPDATE " + taskInfoTable + " SET \"elapsedTime\" = " 
                + std::to_string(time) + " WHERE \"taskID\" = '" + taskID + "'";
            manager.transactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with sending data to DB) "
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    std::vector<std::string> getColumnNames(DBManager const &manager) const {
        try {
            std::string query = "SELECT \"renamedHeader\" FROM " + fileInfoTable
                              + " WHERE \"ID\" = '" + fileID + "'";
            auto rows = manager.defaultQuery(query);
            auto columns = nlohmann::json::parse(rows[0]["\"renamedHeader\""].c_str());
            return columns;
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception (with changing task's error status in DB)"
                      << " caught: " << e.what() << std::endl;
            throw e;
        }
    }
};
