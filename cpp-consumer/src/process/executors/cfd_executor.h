#pragma once

#include <boost/algorithm/string.hpp>

#include "data/database.h"
#include "iexecutor.h"

namespace process {

class CFDExecutor final : public IExecutor {
    bool InternalLoadData(db::DataBase const& /* db */, db::ParamsLoader& loader,
                          BaseConfig const& /* c */, pqxx::row const& row) const final;
    bool SaveResults(db::DataBase const& db, BaseConfig const& c) const final;

public:
    algos::AlgorithmType ResolveAlgoType(std::string const& /* algo */) const final {
        return algos::AlgorithmType::fd_first_dfs;
    }
};
}  // namespace process
