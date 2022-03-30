#pragma once
#include <string>
#include <filesystem>

#include <boost/algorithm/string.hpp>
#include <boost/program_options.hpp>
#include <enum.h>

#include "AlgoFactory.h"
#include "DBManager.h"

BETTER_ENUM(
    TaskMiningType, char,
    ar,
    cfd,
    fd,
    specifictypocluster, typocluster, typofd)

class TaskConfig {
private:
    std::string const task_id_;
    std::string const algo_name_;
    std::string const type_; // "FD", "CFD", "AR", "Typo"

    algos::StdParamsMap params_intersection_;

    static std::string task_state_table;
    static std::string file_info_table;
    static std::string file_format_table;
    static std::string task_config_table;

    static std::string GetSpecificResultTableName(const std::string& prefix) {
        return "\"" + prefix + "TasksResult\"";
    }

    static std::string GetSpecificResultTableName(const TaskConfig& config) {
        return GetSpecificResultTableName(config.GetType());
    }

    static std::string GetSpecificConfigTableName(const std::string& prefix) {
        return "\"" + prefix + "TasksConfig\"";
    }

    static std::string GetSpecificConfigTableName(const TaskConfig& config) {
        return GetSpecificConfigTableName(config.GetType());
    }

    static void PrepareString(std::string& str) {
        for(
            auto pos = std::find(str.begin(), str.end(), '\'');
            pos != str.end();
            pos = std::find(pos, str.end(), '\'')
        ) {
            pos = str.insert(pos + 1, '\'');
            pos++;
        }
    }

    static auto SendBaseQuery(DBManager const &manager,
                       std::string query, std::string query_description) {
        try {
            return manager.TransactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception executing query [" << query_description << "], "
                      << "Info for debug = [" << query << "] \n"
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    void SendUpdateQuery(DBManager const &manager, std::string table_name,
                         std::map<std::string, std::string> values,
                         std::string query_description) const {
        std::vector<std::string> set_attributes;
        for (auto& [key, value]: values) {
            set_attributes.emplace_back('\"' + key + '\"' + "='" + value + '\'');
        }
        std::string expression = boost::join(set_attributes, ",");
        std::string query = "UPDATE " + table_name + " SET " + expression
                            + " WHERE \"taskID\" = '" + task_id_ + "'";
        SendBaseQuery(manager, query, query_description)[0];
    }

    static auto SendSelectQuery(DBManager const &manager, std::string table_name, std::string attr_for_search,
                                std::string id, std::vector<std::string> attributes,
                                std::string query_description) {
        for (auto& attr: attributes) {
            attr = "\"" + attr + "\"";
        }
        std::string attrs_str = boost::join(attributes, ",");
        std::string query = "SELECT" + attrs_str + "FROM " + table_name
                            + " WHERE \"" + attr_for_search + "\" = '" + id + "'";
        return SendBaseQuery(manager, query, query_description)[0];
    }

    static auto SelectConfigInfo(DBManager const &manager, std::string task_id, std::vector<std::string> attrs) {
        return SendSelectQuery(manager, task_config_table, "taskID", task_id, attrs, "Select base task config info");
    }

    static auto SelectFileInfo(DBManager const &manager, std::string file_id, std::vector<std::string> attrs) {
        return SendSelectQuery(manager, file_info_table, "fileID", file_id, attrs, "Select file info");
    }

    static auto SelectFileFormat(DBManager const &manager, std::string file_id, std::vector<std::string> attrs) {
        return SendSelectQuery(manager, file_format_table, "fileID", file_id, attrs, "Select file info");
    }

    static auto SelectSpecificConfigInfo(DBManager const &manager, std::vector<std::string> attrs,
                                         std::string prefix, std::string task_id) {
        return SendSelectQuery(manager, GetSpecificConfigTableName(prefix), "taskID", task_id, attrs,
                               "Select specific task config info");
    }

    static auto SelectTaskStateInfo(DBManager const &manager, std::vector<std::string> attrs,
                                    std::string task_id) {
        return SendSelectQuery(manager, task_state_table, "taskID", task_id, attrs,
                               "Select task state info");
    }

    void UpdateTaskState(DBManager const &manager, std::map<std::string, std::string> values) const {
        SendUpdateQuery(manager, task_state_table, values, "Updating task state");
    }

    void UpdateTaskResult(DBManager const &manager, std::map<std::string, std::string> values) const {
        SendUpdateQuery(manager, GetSpecificResultTableName(*this), values,
                        "Updating task specific result");
    }

    void UpdateTaskConfig(DBManager const &manager, std::map<std::string, std::string> values) const {
        SendUpdateQuery(manager, GetSpecificConfigTableName(*this), values,
                        "Updating task specific result");
    }

public:
    TaskConfig(std::string task_id)
        : task_id_(task_id) {}

    TaskConfig(std::string task_id, std::string const& type, std::string const& algo_name,
               algos::StdParamsMap&& params_intersection)
        : task_id_(task_id), algo_name_(algo_name), type_(type),
          params_intersection_(std::move(params_intersection)) {}

    static TaskConfig GetTaskConfig(DBManager const &manager, std::string task_id) {
        algos::StdParamsMap params;

        auto row = SelectConfigInfo(manager, task_id, { "type", "algorithmName", "fileID" });
        auto type = row[R"("type")"].as<std::string>();
        auto mining_type = TaskMiningType::_from_string_nocase(type.c_str());
        auto algo_name = row[R"("algorithmName")"].as<std::string>();
        auto file_id = row[R"("fileID")"].as<std::string>();

        row = SelectFileInfo(manager, file_id, { "hasHeader", "path", "delimiter" });
        auto delimiter = row[R"("delimiter")"].as<std::string>()[0];
        auto dataset_path = std::filesystem::path(row[R"("path")"].as<std::string>());
        auto has_header = row[R"("hasHeader")"].as<bool>();

        params.insert({
            { "has_header", has_header },
            { "separator", delimiter },
            { "data", dataset_path }
        });

        std::map<std::string, std::vector<std::string>> config_resolution {
            { "FD", { "errorThreshold", "maxLHS", "threadsCount" } },
            { "AR", { "minSupportAR", "minConfidence" } },
        };

        row = SelectSpecificConfigInfo(manager, config_resolution[type], type, task_id);

        switch (mining_type) {
        case TaskMiningType::fd: {
            auto error_threshold = row[R"("errorThreshold")"].as<double>();
            auto max_lhs = row[R"("maxLHS")"].as<unsigned>();
            auto threads_count = row[R"("threadsCount")"].as<ushort>();
            auto is_null_equal_null = true;
            auto seed = 0;
            params.insert({
                {"max_lhs", max_lhs}, {"threads", threads_count},
                {"seed", seed}, {"error", error_threshold},
                {"is_null_equal_null", is_null_equal_null}});
        } break;
        case TaskMiningType::ar: {
            auto min_sup = row[R"("minSupportAR")"].as<double>();
            auto min_conf = row[R"("minConfidence")"].as<double>();
            params.insert({{"minsup", min_sup}, {"minconf", min_conf}});

            row = SelectFileFormat(
                manager, file_id,
                { "inputFormat", "tidColumnIndex", "itemColumnIndex", "hasTid" });

            auto input_format = row[R"("inputFormat")"].as<std::string>();
            boost::to_lower(input_format);
            params.insert({"input_format", input_format });
            if (input_format == "singular") {
                auto tid_col_index = row[R"("tidColumnIndex")"].as<unsigned>() - 1;
                auto item_col_index = row[R"("itemColumnIndex")"].as<unsigned>() - 1;
                params.insert({{"tid_column_index", tid_col_index},
                               {"item_column_index", item_col_index}});
            } else if (input_format == "tabular") {
                auto has_tid = row[R"("hasTid")"].as<bool>();
                params.insert({ "has_tid", has_tid });
            }
        } break;
        default:
            throw new std::runtime_error("Type not supported");
        }
        return { task_id, type, algo_name, std::move(params) };
    }

    const auto& GetParamsIntersection() const {
        return params_intersection_;
    }

    const std::string& GetTaskID() const { return task_id_; }
    const std::string& GetAlgo() const { return algo_name_; }
    const std::string& GetType() const { return type_; }

    static bool IsTaskValid(DBManager const &manager, std::string task_id) {
        std::string query = "SELECT \"taskID\" FROM " + task_state_table +
                            " WHERE \"deletedAt\" IS NULL"
                            " AND \"taskID\" = '" + task_id + "'";
        auto answer = manager.DefaultQuery(query);
        return answer.size() == 1;
    }

    // Send a request to DB for status updating
    void UpdateStatus(DBManager const &manager, std::string status) const {
        UpdateTaskState(manager, {{ "status", status }});
    }

    void SetMaxPhase(DBManager const& manager, size_t maxPhase) const {
        UpdateTaskState(manager, {{"maxPhase", std::to_string(maxPhase)}});
    }

    // Send a request to DB for progress updating
    void UpdateProgress(DBManager const &manager, double progress_percent,
        std::string const &phase_name, size_t cur_phase) const {
        UpdateTaskState(
            manager,
            {
                {"progress",std::to_string(progress_percent)},
                {"phaseName",phase_name},
                {"currentPhase", std::to_string(cur_phase)}
            });
    }

    // Send a request to DB with JSON array of primary key column positions
    void UpdatePKColumnPositions(DBManager const &manager,
                                 std::string const &keys_indices) const{
        UpdateTaskResult(manager, {{"PKColumnIndices", keys_indices}});
    }

    void SetIsExecuted(DBManager const& manager) const {
        UpdateTaskState(manager, {{ "isExecuted", "true" }});
    }

    // Send a request to DB with a set of FDs/CFDs/ARs
    void UpdateDeps(DBManager const& manager, const std::string& deps) const {
        assert(type_ == "FD" || type_ == "CFD" || type_ == "AR");

        auto deps_name = type_ + "s";
        UpdateTaskResult(manager, {{deps_name, deps}});
    }

    // Send a request to DB with a set of FDs/CFDs/ARs
    void UpdateValueDictionary(DBManager const& manager, const std::string& valueDictionary) const {
        UpdateTaskResult(manager, {{"valueDictionary", valueDictionary}});
    }

    // Send a request to DB with JSON array (data for pie chart for client)
    void UpdatePieChartData(DBManager const& manager, const std::string& pie_chart_data) const {
        UpdateTaskResult(manager, {{ "pieChartData", pie_chart_data }});
    }

    void UpdateDepsAmount(DBManager const& manager, size_t amount, std::string attr_name = "depsAmount") const {
        UpdateTaskResult(manager, {{ attr_name, std::to_string(amount) }});
    }

    // Send a request to DB for changing task's status to 'ERROR'
    // and update errorMsg;
    void UpdateErrorStatus(DBManager const& manager, std::string error,
                           std::string error_msg) const {
        UpdateTaskState(manager, {{ "status", error }, { "errorMsg", error_msg }});
    }

    void SetElapsedTime(DBManager const& manager, unsigned long long time) const {
        UpdateTaskState(manager, {{ "elapsedTime", std::to_string(time) }});
    }
};