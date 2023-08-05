#pragma once

#include <memory>
#include <pqxx/pqxx>
#include <string>

namespace db {

class DataBase {
    std::unique_ptr<pqxx::connection> connection_;

public:
    struct ConnectionConfig {
        std::string host;
        unsigned int port;
        std::string user;
        std::string password;
        std::string dbname;
    };

    explicit DataBase(std::string const& pg_connection) {
        connection_ = std::make_unique<pqxx::connection>(pg_connection);
    }

    explicit DataBase(ConnectionConfig const& config)
        : DataBase("postgresql://" + config.user + ":" + config.password + "@" + config.host + ":" +
                   std::to_string(config.port) + "/" + config.dbname) {}

    pqxx::result Query(std::string const& query) const;
    pqxx::result TransactionQuery(std::string const& query) const;
};

}  // namespace db
