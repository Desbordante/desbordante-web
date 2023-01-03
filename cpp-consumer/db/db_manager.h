#pragma once

#include <iostream>
#include <pqxx/nontransaction>
#include <pqxx/pqxx>
#include <easylogging++.h>

#include "raw_query.h"

namespace consumer {

class DBManager {
    std::unique_ptr<pqxx::connection> connection_;

    explicit DBManager(std::string const& pg_connection) {
        connection_ = std::make_unique<pqxx::connection>(pg_connection);
    }

public:
    struct Config {
        std::string host;
        std::string port;
        std::string user;
        std::string password;
        std::string dbname;

        std::string ToString() const {
            return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
        }
    };

public:
    explicit DBManager(const Config& config) : DBManager(config.ToString()) {}

    template <typename T = pqxx::work, typename Query>
    pqxx::result Send(Query&& query) const {
        static_assert(std::is_same_v<T, pqxx::nontransaction> || std::is_same_v<T, pqxx::work>,
                      "T must be pqxx::nontransaction or pqxx::work");
        static_assert(std::is_base_of_v<query::BaseQuery, Query>,
                      "Query must be derived from query::BaseQuery");
        try {
            auto w = std::make_unique<pqxx::nontransaction>(*connection_);
            std::string query_text;
            if constexpr (std::is_base_of_v<query::BaseQuery, Query>) {
                query_text = query.ToString();
            } else {
                query_text = query;
            }
            LOG(DEBUG) << query_text;
            pqxx::result r = w->exec(query_text);
            w->commit();
            return r;
        } catch (const std::exception& e) {
            std::cerr << e.what() << std::endl;
            throw e;
        }
    }
};

}  // namespace consumer
