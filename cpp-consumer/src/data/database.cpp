#include "database.h"

#include <iostream>

#include <boost/algorithm/string.hpp>
#include <easylogging++.h>

#include "util/overloaded.h"

namespace db {

static std::string ToQuery(Select const& s) {
    std::stringstream ss;
    ss << "SELECT ";
    for (auto it = s.select.begin(); it != s.select.end(); std::advance(it, 1)) {
        if (it != s.select.begin()) {
            ss << ",";
        }
        ss << *it;
    }
    ss << '\n';
    ss << "FROM " << s.from << '\n';
    ss << "WHERE ";
    for (auto it = s.conditions.begin(); it != s.conditions.end(); std::advance(it, 1)) {
        if (it != s.conditions.begin()) {
            ss << " AND ";
        }
        auto const& [rel, value] = *it;
        ss << rel << " = '" << value << "'";
    }
    return ss.str();
}

static std::string ToQuery(Update const& u) {
    std::stringstream ss;
    ss << "UPDATE " << u.table << '\n';
    ss << "SET ";
    for (auto it = u.set.begin(); it != u.set.end(); std::advance(it, 1)) {
        if (it != u.set.begin()) {
            ss << " , ";
        }
        auto const& [rel, value] = *it;
        ss << rel << " = '" << value << "'";
    }

    ss << '\n';
    ss << "WHERE ";
    for (auto it = u.conditions.begin(); it != u.conditions.end(); std::advance(it, 1)) {
        if (it != u.conditions.begin()) {
            ss << " AND ";
        }
        auto const& [rel, value] = *it;
        ss << rel << " = '" << value << "'";
    }
    ss << '\n';
    return ss.str();
}

static std::string ToQuery(Insert const& i) {
    std::stringstream ss;
    ss << "INSERT INTO " << i.table << " (" << boost::join(i.keys, ",") << ") ";
    ss << "VALUES";

    for (size_t j = 0; j != i.values.size(); ++j) {
        if (j != 0) {
            ss << " , ";
        }
        ss << "(" << boost::join(i.values[j], ",") << ")";
    }
    return ss.str();
}

static std::string ToQuery(std::string const& query) {
    return query;
}

static std::string ToQuery(Query const& query) {
    return std::visit(util::overloaded{[](auto const& select) { return ToQuery(select); }}, query);
}

pqxx::result DataBase::Query(db::Query const& query) const {
    try {
        auto w = std::make_unique<pqxx::nontransaction>(*connection_);
        std::string query_text = ToQuery(query);
        LOG(DEBUG) << query_text << "\n";
        pqxx::result r = w->exec(query_text);
        w->commit();
        return r;
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
        throw e;
    }
}

pqxx::result DataBase::TransactionQuery(db::Query const& query) const {
    try {
        auto w = std::make_unique<pqxx::work>(*connection_);
        std::string query_text = ToQuery(query);
        LOG(INFO) << query_text << "\n";
        pqxx::result r = w->exec(query_text);
        w->commit();
        return r;
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
        throw;
    }
}

}  // namespace db
