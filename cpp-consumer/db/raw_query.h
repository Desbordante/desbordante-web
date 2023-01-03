#pragma once

#include <boost/algorithm/string.hpp>

#include <string>
#include <utility>

namespace consumer::query {

class BaseQuery {
public:
    virtual std::string ToString() const = 0;
};

namespace details {

class BaseRawQuery : public BaseQuery {
private:
    virtual std::vector<std::string> GetQueryItems() const = 0;

public:
    std::string ToString() const final {
        std::string query = boost::join(GetQueryItems(), " ");
        LOG(DEBUG) << query;
        return query;
    }
};

class RawSelectQuery final : public BaseRawQuery {
private:
    std::string select;
    std::string from;
    std::string where;

public:
    RawSelectQuery(std::string&& select, std::string&& from, std::string&& where)
        : select(std::move(select)), from(std::move(from)), where(std::move(where)) {}

    std::vector<std::string> GetQueryItems() const override {
        return {"SELECT", select, "FROM", from, "WHERE", where};
    }
};

class RawUpdateQuery final : public BaseRawQuery {
private:
    std::string table;
    std::string set_values;
    std::string where;

public:
    RawUpdateQuery(std::string&& table, std::string&& set_values, std::string&& where)
        : table(std::move(table)), set_values(std::move(set_values)), where(std::move(where)) {}

    std::vector<std::string> GetQueryItems() const override {
        return {"UPDATE", table, "SET", set_values, "WHERE", where};
    }
};

class RawInsertQuery final : public BaseQuery {
private:
    std::string table;
    std::vector<std::string> keys;
    std::vector<std::string> values;

public:
    RawInsertQuery(std::string&& table, std::vector<std::string>&& keys,
                   std::vector<std::string>&& values)
        : table(std::move(table)), keys(std::move(keys)), values(std::move(values)) {}

    std::string ToString() const {
        std::vector<std::string> query_items{"INSERT INTO", table,
                                             "(" + boost::join(keys, ",") + ")", "VALUES",
                                             "(" + boost::join(values, ",") + ")"};
        std::string query = boost::join(query_items, " ");
        LOG(INFO) << query;
        return query;
    }
};

}  // namespace details

template <typename RawQuery>
class BaseSpecificQuery : public BaseQuery {
    virtual RawQuery ToRawQuery() const = 0;

public:
    std::string ToString() const {
        return ToRawQuery().ToString();
    }

    static std::string GetTransformedName(const std::string& name) {
        return '"' + name + '"';
    }

    static void TransformName(std::string& name) {
        name = GetTransformedName(name);
    }
};

class SelectQuery : public BaseSpecificQuery<details::RawSelectQuery> {
public:
    using TableName = std::string;
    using AttributeName = std::string;
    using Conjunction = std::pair<AttributeName, std::string>;

private:
    std::vector<AttributeName> projection_items_;
    TableName table_name_;
    std::vector<Conjunction> conjunctions_;

    virtual std::vector<AttributeName> GetAttributes() const {
        if (projection_items_.empty()) {
            return { "COUNT(*)" };
        }
        auto attrs{projection_items_};
        std::for_each(std::begin(attrs), std::end(attrs), TransformName);
        return attrs;
    }

public:
    SelectQuery(std::vector<AttributeName>&& select_attrs, TableName table_name,
                std::vector<Conjunction>&& conjunctions)
        : projection_items_(std::move(select_attrs)),
          table_name_(std::move(table_name)),
          conjunctions_(std::move(conjunctions)) {}

    details::RawSelectQuery ToRawQuery() const final {
        std::vector<std::string> conjunctions{};
        conjunctions.reserve(conjunctions_.size());
        for (auto& [attr, condition] : conjunctions_) {
            conjunctions.emplace_back(GetTransformedName(attr) + " " + condition);
        }
        return {boost::join(GetAttributes(), ","), GetTransformedName(table_name_),
                boost::join(conjunctions, " AND ")};
    };
};

class UpdateQuery final : public BaseSpecificQuery<details::RawUpdateQuery> {
    using TableName = std::string;
    using AttributeName = std::string;
    using Conjunction = std::pair<AttributeName, std::string>;

    std::map<std::string, std::string> set_values_;
    TableName table_name_;
    std::vector<Conjunction> conjunctions_;

public:
    UpdateQuery(std::map<std::string, std::string>&& set_values, TableName table_name,
                std::vector<Conjunction>&& conjunctions)
        : set_values_(std::move(set_values)),
          table_name_(std::move(table_name)),
          conjunctions_(std::move(conjunctions)) {}

    details::RawUpdateQuery ToRawQuery() const final {
        std::vector<std::string> set_attributes;
        set_attributes.reserve(set_values_.size());
        for (auto const& [attr, value] : set_values_) {
            set_attributes.emplace_back(GetTransformedName(attr) + "='" + value + "'");
        }

        std::vector<std::string> conjunctions{};
        conjunctions.reserve(conjunctions_.size());
        for (auto& [attr, condition] : conjunctions_) {
            conjunctions.emplace_back(GetTransformedName(attr) + "='" + condition + "'");
        }

        return {GetTransformedName(table_name_), boost::join(set_attributes, ","),
                boost::join(conjunctions, " AND ")};
    };
};

class InsertQuery final : public BaseSpecificQuery<details::RawInsertQuery> {
    using TableName = std::string;
    TableName table_name_;
    std::unordered_map<std::string, std::string>&& insertions_;

public:
    InsertQuery(TableName table_name, std::unordered_map<std::string, std::string>&& insertions)
        : table_name_(std::move(table_name)), insertions_(std::move(insertions)) {}

    details::RawInsertQuery ToRawQuery() const final {
        std::vector<std::string> keys;
        std::vector<std::string> values;
        for (const auto& [key, value] : insertions_) {
            keys.emplace_back(GetTransformedName(key));
            values.emplace_back(GetTransformedName(value));
        }

        return {GetTransformedName(table_name_), std::move(keys), std::move(values)};
    };
};

}  // namespace consumer::query
