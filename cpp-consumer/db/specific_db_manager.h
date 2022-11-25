#pragma once

#include <easylogging++.h>

#include "db_manager.h"
#include "field_wrapper.h"

namespace consumer {

/*
 * The class contains two types of tables. For each table, you must specify the key by which the
 * search will be performed and the attribute that will be used in WHERE clause
 */
template <typename BaseTableKey, typename SpecificTableKey, typename SearchByAttribute>
class SpecificDbManager : public DbManager {
private:
    template <typename TableMapKey>
    std::shared_ptr<ExtendedAttributeBase> GetAttributeByConfigName(TableMapKey search_key,
                                                                    std::string name) const {
        const auto& extended_attrs = std::get<2>(GetTableInfo(search_key));

        for (const auto& attr : extended_attrs) {
            if (attr->GetConfigAttrName() == name) {
                return attr;
            }
        }
        throw std::runtime_error("Attribute " + name + " not found in " +
                                 std::get<0>(GetTableInfo(search_key)) + '\n');
    }

public:
    using TableName = std::string;
    using FieldName = std::string;
    using Condition = std::string;
    using TableInfo = std::tuple<TableName, SearchByAttribute,
                                 std::vector<std::shared_ptr<ExtendedAttributeBase>>>;
    using BaseTables = std::map<BaseTableKey, TableInfo>;
    using SpecificTables = std::map<SpecificTableKey, TableInfo>;

    explicit SpecificDbManager(std::string&& connection, BaseTables&& base_tables,
                               SpecificTables&& specific_tables)
        : DbManager(std::move(connection)),
          base_tables_(std::move(base_tables)),
          specific_tables_(std::move(specific_tables)) {}

    static void PrepareString(std::string& str) {
        for (auto pos = std::find(str.begin(), str.end(), '\''); pos != str.end();
             pos = std::find(pos, str.end(), '\'')) {
            pos = str.insert(pos + 1, '\'');
            pos++;
        }
    }

    pqxx::result SendBaseQuery(std::string query, const std::string& query_description) const {
        try {
            return DbManager::TransactionQuery(query);
        } catch (const std::exception& e) {
            std::cerr << "Unexpected exception executing transaction query [" << query_description
                      << "], "
                      << "Info for debug = [" << query << "] \n"
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    pqxx::result SendInsertQuery(const std::unordered_map<std::string, std::string> insertions, 
                                 const std::string& table_name) const {
        std::vector<std::string> keys;
        std::vector<std::string> values;
        for (const auto& [key, value] : insertions) {
            keys.emplace_back("\"" + key + "\"");
            values.emplace_back("\'" + value + "\'");
        }
        std::string query = "INSERT INTO \"" + table_name + "\" (" + boost::join(keys, ",") +
            ") VALUES (" + boost::join(values, ",") + ")";
        return SendBaseQuery(query, "Insert into table " + table_name + ": \'" + query + "\'");
    }

    const TableInfo& GetTableInfo(BaseTableKey search_key) const {
        return base_tables_.at(search_key);
    }

    const TableInfo& GetTableInfo(SpecificTableKey search_key) const {
        return specific_tables_.at(search_key);
    }

    template <typename TableKey>
    void SendUpdateQuery(TableKey search_key, std::map<std::string, std::string>&& values,
                         const std::string& id) const {
        std::vector<std::string> set_attributes;
        for (const auto& [key, value] : values) {
            std::string str = '\"' + GetAttributeByConfigName(search_key, key)->GetDbAttrName() +
                              '\"' + "='" + value + '\'';
            set_attributes.emplace_back(str);
        }
        std::string expression = boost::join(set_attributes, ",");
        const auto& [table_name, search_by, attrs] = GetTableInfo(search_key);
        std::string query = "UPDATE " + table_name + " SET " + expression + " WHERE " + "\"" +
                            (+search_by)._to_string() + "\" = '" + id + "'";
        LOG(DEBUG) << query;
        SendBaseQuery(query, "Update table " + table_name + " " + expression);
    }

    template <typename TableKey>
    pqxx::result SendSelectQuery(
        TableKey search_key, std::vector<std::string> attributes, std::string id,
        std::vector<std::pair<FieldName, Condition>>&& addition_conditions = {}) const {
        const auto& [table_name, search_by, attrs] = GetTableInfo(search_key);
        if (attributes.empty()) {
            attributes.push_back(attrs[0]->GetDbAttrName());
        }
        for (auto& attr : attributes) {
            attr = "\"" + attr + "\"";
        }

        std::string attrs_str = boost::join(attributes, ",");
        std::string where_condition =
            " WHERE \"" + std::string((+search_by)._to_string()) + "\" = '" + id + "' ";
        for (auto& [field, condition] : addition_conditions) {
            where_condition.append("AND \"" + field + "\" ");
            where_condition.append(condition + " ");
        }

        std::string query = "SELECT" + attrs_str + "FROM " + table_name + where_condition;
        LOG(INFO) << query;
        return SendBaseQuery(query, "Select from table " + table_name + " " + attrs_str +
                                        " where " + (+search_by)._to_string());
    }

private:
    BaseTables base_tables_;
    SpecificTables specific_tables_;
};

}
