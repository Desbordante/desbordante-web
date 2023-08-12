#pragma once

#include <pqxx/pqxx>
#include <string>
#include <unordered_map>

#include <easylogging++.h>

namespace db {
class ParamsLoader {
public:
    using ParamsMap = std::unordered_map<std::string, std::string>;
    using NameAlias = std::pair<std::string, std::string>;

private:
    ParamsMap params_;

public:
    bool SetOption(pqxx::row const& row, NameAlias const& mapping);
    bool SetOption(std::string const& name, std::string const& value);
    bool SetOption(pqxx::row const& row, std::string const& name, std::string const& alias = "");
    bool SetOptions(pqxx::row const& row, std::vector<NameAlias> const& names_mapping);

    ParamsMap const& GetParams() const {
        return params_;
    }
    ParamsMap& GetParams() {
        return params_;
    }
    void Reset() {
        params_.clear();
    }
};
}  // namespace db
