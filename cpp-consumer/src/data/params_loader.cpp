#include "params_loader.h"

namespace db {
bool ParamsLoader::SetOption(pqxx::row const& row, NameAlias const& mapping) {
    auto const& [name, alias] = mapping;
    return SetOption(row, name, alias);
}

bool ParamsLoader::SetOption(std::string const& name, std::string const& value) {
    auto const& [it, isInserted] = params_.emplace(name, value);
    LOG(DEBUG) << "set " << name << " " << value << std::boolalpha << " " << isInserted;
    return isInserted;
}

bool ParamsLoader::SetOption(pqxx::row const& row, std::string const& name,
                             std::string const& alias) {
    std::string opt_name = alias.empty() ? name : alias;
    return SetOption(alias, row[name].c_str());
}

bool ParamsLoader::SetOptions(pqxx::row const& row, std::vector<NameAlias> const& names_mapping) {
    auto pred = [&loader = *this, &row](const NameAlias& mapping) {
        bool res = loader.SetOption(row, mapping);
        if (!res) {
            LOG(INFO) << "Cannot set option '" << mapping.first << "'"
                      << " to '" << mapping.second << "'";
        }
        return res;
    };
    return std::all_of(names_mapping.begin(), names_mapping.end(), pred);
}
}  // namespace db
