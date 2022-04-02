#pragma once
#include <iostream>
#include <pqxx/pqxx>
#include <pqxx/nontransaction>

namespace consumer {

class DbManager {
    std::unique_ptr<pqxx::connection> connection_;

protected:
    pqxx::result DefaultQuery(std::string query_text) const {
        try {
            auto w = std::make_unique<pqxx::nontransaction>(*connection_);
            pqxx::result r = w->exec(query_text);
            w->commit();
            return r;
        } catch (const std::exception& e) {
            std::cerr << e.what() << std::endl;
            throw e;
        }
    }

    pqxx::result TransactionQuery(std::string query) const {
        try {
            auto l_work = std::make_unique<pqxx::work>(*connection_);
            pqxx::result r = l_work->exec(query);
            l_work->commit();
            return r;
        } catch (const std::exception& e) {
            std::cerr << e.what() << std::endl;
            throw;
        }
    }
public:
    explicit DbManager(std::string pg_connection) {
        connection_ = std::make_unique<pqxx::connection>(pg_connection);
    }
};

}