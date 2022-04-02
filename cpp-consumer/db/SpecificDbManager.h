#pragma once

#include "DbManager.h"
#include "FieldWrapper.h"

namespace consumer {


template<typename SpecificTable, typename BaseTable, typename SearchBy>
class SpecificDbManager : public DbManager {
private:
    template<typename TableMapKey>
    std::shared_ptr<ExtendedAttributeBase> GetAttributeByConfigName(TableMapKey search_key, std::string name) const {
        const auto& extended_attrs = std::get<2>(GetTableInfo(search_key));

        for (const auto& attr: extended_attrs) {
            if (attr->GetConfigAttrName() == name) {
                return attr;
            }
        }
        throw std::runtime_error("Attribute " + name + " not found in " + std::get<0>(GetTableInfo(search_key)) + '\n');
    }

public:
    using TableName = std::string;
    using FieldName = std::string;
    using Condition = std::string;
    using TableInfo =
        std::tuple<TableName, SearchBy, std::vector<std::shared_ptr<ExtendedAttributeBase>>>;
    using BaseTables = std::map<BaseTable, TableInfo>;
    using SpecificTables = std::map<SpecificTable, TableInfo>;

    explicit SpecificDbManager(
        std::string&& connection, BaseTables&& base_tables, SpecificTables&& specific_tables)
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
            std::cerr << "Unexpected exception executing transaction query [" << query_description << "], "
                      << "Info for debug = [" << query << "] \n"
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    const TableInfo& GetTableInfo(BaseTable search_key) const {
        return base_tables_.at(search_key);
    }

    const TableInfo& GetTableInfo(SpecificTable search_key) const {
        return specific_tables_.at(search_key);
    }

    template<typename TableMapKey>
    void SendUpdateQuery(TableMapKey search_key, std::map<std::string, std::string>&& values,
                         const std::string& id) const {
        std::vector<std::string> set_attributes;
        for (const auto& [key, value] : values) {
            std::string str = '\"' + GetAttributeByConfigName(search_key, key)->GetDbAttrName() + '\"' + "='" + value + '\'';
            set_attributes.emplace_back(str);
        }
        std::string expression = boost::join(set_attributes, ",");
        const auto& [table_name, search_by, attrs] = GetTableInfo(search_key);
        std::string query = "UPDATE " + table_name + " SET " + expression + " WHERE " +
                            "\"" + (+search_by)._to_string() + "\" = '" + id + "'";
        SendBaseQuery(query, "Update table " + table_name + " " + expression);
    }

    template<typename TableMapKey>
    pqxx::result SendSelectQuery(TableMapKey search_key,
                              std::vector<std::string> attributes, std::string id,
                              std::vector<std::pair<FieldName, Condition>>&& addition_conditions = {}) const {
        const auto& [table_name, search_by, attrs] = GetTableInfo(search_key);
        if (attributes.empty()) {
            attributes.push_back(attrs[0]->GetDbAttrName());
        }
        for (auto& attr : attributes) {
            attr = "\"" + attr + "\"";
        }

        std::string attrs_str = boost::join(attributes, ",");
        std::string where_condition = " WHERE \"" + std::string((+search_by)._to_string()) + "\" = '" + id + "' ";
        for (auto& [field, condition] : addition_conditions) {
            where_condition.append("AND \"" + field + "\" " );
            where_condition.append(condition + " ");
        }

        std::string query = "SELECT" + attrs_str + "FROM " + table_name + where_condition;
        return SendBaseQuery(query, "Select from table " + table_name + " " + attrs_str + " where " + (+search_by)._to_string());
    }

private:
    BaseTables base_tables_;
    SpecificTables specific_tables_;
};

}