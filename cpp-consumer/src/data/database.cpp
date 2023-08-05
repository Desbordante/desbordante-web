#include "database.h"

#include <iostream>

namespace db {

pqxx::result DataBase::Query(std::string const& query) const {
    try {
        auto w = std::make_unique<pqxx::nontransaction>(*connection_);
        pqxx::result r = w->exec(query);
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
