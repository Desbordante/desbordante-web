#pragma once

#include <pqxx/pqxx>
#include <string>
#include <unordered_map>

#include <easylogging++.h>

namespace db {
class ParamsLoader {
public:
    using ParamsMap = std::unordered_map<std::string, std::vector<std::string>>;
    using NameAlias = std::pair<std::string, std::string>;

private:
    ParamsMap params_;

    bool SetOption(pqxx::row const& row, std::string const& name, std::string const& alias = "");

public:
    bool SetOption(pqxx::row const& row, NameAlias const& mapping);

    /**
     * @brief Method for setting multitoken option.
     *
     * @code
     *      {
     *         // Suppose, that 'indices' is multitoken option.
     *         // The following code is equivalent to '--indices=0 3 5'
     *         loader_.SetOption('indices', std::vector<std::string>({"0", "3", "5"}));
     *      }
     */
    bool SetOption(std::string const& name, std::vector<std::string> const& values);
    /**
     * @brief Method for setting single option.
     *
     * @code
     *      {
     *         // The following code is equivalent to '--error=1'
     *         loader_.SetOption('error', "1");
     *      }
     */
    bool SetOption(std::string const& name, std::string const& value);
    /**
     * @brief Method for setting several options.
     *
     * This method sets options by taking values from the passed string using
     * name mapping. Only those options that are present in the mapping will
     * be exposed.
     *
     * @param row[in]            Row, that contains attribute names and values.
     * @param names_mapping[in]  Mapping between attribute names and names under
     *                           which attributes will be stored.
     */
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
