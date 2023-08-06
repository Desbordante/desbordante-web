#pragma once

#include <memory>
#include <pqxx/pqxx>
#include <string>
#include <variant>

namespace db {

struct Select {
    std::vector<std::string> select;
    std::string from;
    std::vector<std::pair<std::string, std::string>> conditions;
};

using Query = std::variant<Select, std::string>;

class DataBase {
    std::unique_ptr<pqxx::connection> connection_;

public:
    struct Config {
        std::string host;
        unsigned int port;
        std::string user;
        std::string password;
        std::string dbname;
    };

    explicit DataBase(std::string const& pg_connection) {
        connection_ = std::make_unique<pqxx::connection>(pg_connection);
    }

    explicit DataBase(Config const& config)
        : DataBase("postgresql://" + config.user + ":" + config.password + "@" + config.host + ":" +
                   std::to_string(config.port) + "/" + config.dbname) {}

    pqxx::result Query(Query const& query) const;
    pqxx::result TransactionQuery(std::string const& query) const;
};

}  // namespace db
