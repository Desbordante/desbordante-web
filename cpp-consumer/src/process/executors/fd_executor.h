#pragma once

#include "data/database.h"
#include "iexecutor.h"

namespace process {

class FDExecutor final : public IExecutor {
    bool InternalLoadData(db::DataBase const& /* db */, db::ParamsLoader& loader,
                          BaseConfig const& /* c */, pqxx::row const& row) final {
        using namespace util::config::names;
        return loader.SetOptions(row, {{R"("errorThreshold")", kError},
                                       {R"("maxLHS")", kMaximumLhs},
                                       {R"("threadsCount")", kThreads}});
    }
};
}  // namespace process
