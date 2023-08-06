#include "database.h"

#include <iostream>

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

static std::string ToQuery(std::string const& query) {
    return query;
}

pqxx::result DataBase::Query(db::Query const& query) const {
    try {
        auto w = std::make_unique<pqxx::nontransaction>(*connection_);
        std::string query_text = std::visit(
                util::overloaded{[](auto const& select) { return ToQuery(select); }}, query);
        LOG(INFO) << query_text << "\n";
        pqxx::result r = w->exec(query_text);
        w->commit();
        return r;
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
        throw e;
    }
}

pqxx::result DataBase::TransactionQuery(std::string const& query) const {
    try {
        auto w = std::make_unique<pqxx::work>(*connection_);
        pqxx::result r = w->exec(query);
        w->commit();
        return r;
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
        throw;
    }
}

}  // namespace db
