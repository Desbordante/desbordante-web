#pragma once

#include <boost/algorithm/string.hpp>

#include "data/database.h"
#include "iexecutor.h"

namespace process {

class FDExecutor final : public IExecutor {
    bool InternalLoadData(db::DataBase const& /* db */, db::ParamsLoader& loader,
                          BaseConfig const& /* c */, pqxx::row const& row) final {
        using namespace config::names;
        return loader.SetOptions(row, {{R"("errorThreshold")", kError},
                                       {R"("maxLHS")", kMaximumLhs},
                                       {R"("threadsCount")", kThreads}});
    }
    bool SaveResults(db::DataBase const& db, BaseConfig const& c) final;
};
}  // namespace process
