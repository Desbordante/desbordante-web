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

struct Update {
    std::vector<std::pair<std::string, std::string>> set;
    std::string table;
    std::vector<std::pair<std::string, std::string>> conditions;
};

using Query = std::variant<Select, Update, std::string>;

class DataBase {
    std::unique_ptr<pqxx::connection> connection_;

public:
    struct Config {
        std::string host;
        int port;
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

    pqxx::result Query(db::Query const& query) const;
    pqxx::result TransactionQuery(db::Query const& query) const;
};

}  // namespace db
