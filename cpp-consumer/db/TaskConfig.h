#pragma once
#include <string>
#include <filesystem>

#include <boost/algorithm/string.hpp>
#include <boost/program_options.hpp>

#include "AlgoFactory.h"
#include "DBManager.h"

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

    static std::string GetSpecificResultTableName(const TaskConfig& config) {
        return "\"" + config.GetType() + "TasksResult\"";
    }

    static std::string GetSpecificConfigTableName(const TaskConfig& config) {
        return "\"" + config.GetType() + "TasksConfig\"";
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
        try {
            manager.TransactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception executing query [" << query_description << "], "
                      << "Info for debug = [" << expression << "] \n"
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
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

    TaskConfig(std::string task_id, std::string const& type, std::string const& algo_name,
               algos::StdParamsMap&& params_intersection)
        : task_id_(task_id), algo_name_(algo_name), type_(type),
          params_intersection_(std::move(params_intersection)) {}

    static TaskConfig GetTaskConfig(DBManager const &manager, std::string task_id) {
        algos::StdParamsMap params;
        std::string postfix = " WHERE \"taskID\" = '" + task_id + "'";

        std::string query = "SELECT \"type\" from " + task_config_table + postfix;
        auto rows = manager.DefaultQuery(query);
        std::string primitive_type = rows[0]["\"type\""].c_str();

        query = "SELECT \"algorithmName\", \"fileID\" FROM " + task_config_table + postfix;
        rows = manager.DefaultQuery(query);
        std::string algo_name = rows[0]["\"algorithmName\""].c_str();
        std::string file_id = rows[0]["\"fileID\""].c_str();
        std::string file_postfix = " WHERE \"fileID\" = '" + file_id + "'";

        query = "SELECT \"hasHeader\", \"path\", \"delimiter\" FROM "
                + file_info_table + file_postfix;
        rows = manager.DefaultQuery(query);
        char delimiter = rows[0]["\"delimiter\""].c_str()[0];
        std::string path = (rows[0]["\"path\""]).c_str();
        std::filesystem::path dataset_path = path;
        bool has_header;
        rows[0]["\"hasHeader\""] >> has_header;

        params.insert({{ "has_header", has_header },{ "separator", delimiter },
                       { "data", dataset_path }});

        auto specific_config_table = "\"" + primitive_type + "TasksConfig\"";

        std::map<std::string, std::vector<std::string>> config_resolution {
            { "FD", { "\"errorThreshold\"", "\"maxLHS\"", "\"threadsCount\"" } },
            { "AR", { "\"minSupportAR\"", "\"minConfidence\"" } },
        };

        query = "SELECT " + boost::join(config_resolution[primitive_type], ",")
                + " FROM " + specific_config_table + postfix;
        rows = manager.DefaultQuery(query);

        if (primitive_type == "FD") {
            auto error_threshold = std::stod(rows[0]["\"errorThreshold\""].c_str());
            auto max_lhs = (unsigned)std::stoi(rows[0]["\"maxLHS\""].c_str());
            auto threads_count = (ushort)std::stoi(rows[0]["\"threadsCount\""].c_str());
            bool is_null_equal_null = true;
            int seed = 0;
            params.insert({
                {"max_lhs", max_lhs}, {"threads", threads_count}, { "seed", seed},
                {"error", error_threshold}, { "is_null_equal_null", is_null_equal_null }});
        } else if (primitive_type == "AR") {
            auto min_sup = std::stod(rows[0]["\"minSupportAR\""].c_str());
            auto min_conf = std::stod(rows[0]["\"minConfidence\""].c_str());
            params.insert({{ "minsup", min_sup }, { "minconf", min_conf }});

            std::vector<std::string> file_format_attrs = {
                "\"inputFormat\"", "\"tidColumnIndex\"", "\"itemColumnIndex\"", "\"hasTid\"" };

            query = "SELECT " + boost::join(file_format_attrs, ",")
                    + " FROM " + file_format_table + file_postfix;
            rows = manager.DefaultQuery(query);

            std::string input_format = rows[0]["\"inputFormat\""].c_str();
            std::string lower_input_format = boost::to_lower_copy(input_format);
            params.insert({ "input_format", lower_input_format });
            if (input_format == "SINGULAR") {
                auto tid_column_index = (unsigned)std::stoi(rows[0]["\"tidColumnIndex\""].c_str()) - 1;
                auto item_column_index = (unsigned)std::stoi(rows[0]["\"itemColumnIndex\""].c_str()) - 1;
                params.insert({
                    { "tid_column_index", tid_column_index },
                    { "item_column_index", item_column_index }});
            } else if (input_format == "TABULAR") {
                bool has_tid;
                rows[0]["\"hasTid\""] >> has_tid;
                params.insert({ "has_tid", has_tid });
            }
        }
        return { task_id, primitive_type, algo_name, std::move(params) };
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