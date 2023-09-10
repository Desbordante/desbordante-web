#pragma once

#include <memory>
#include <pqxx/pqxx>
#include <string>
#include <unordered_map>
#include <variant>

namespace db {

/**
 * @brief Simple select query
 *
 * @code
 * {
 *  // equal to
 *  // SELECT "fileID", "fileName" FROM "FilesInfo" WHERE "fileID"='value';
 *  Select s{
 *    .select={"fileID", "fileName"},
 *    .from="FilesInfo",
 *    .conditions={"fileID", "value"}
 *  };
 * }
 */
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

using KeysVec = std::vector<std::string>;
using Value = std::vector<std::string>;
using Values = std::vector<Value>;

struct Insert {
    KeysVec keys;
    Values values;
    std::string table;
};

using Query = std::variant<Select, Update, Insert, std::string>;

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
