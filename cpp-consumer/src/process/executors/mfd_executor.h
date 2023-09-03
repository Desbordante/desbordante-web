#pragma once

#include <boost/algorithm/string.hpp>

#include "data/database.h"
#include "iexecutor.h"

namespace process {

class MFDExecutor final : public IExecutor {
private:
    using HighlightsVec = std::vector<algos::metric::Highlight>;
    using HighlightsData = std::vector<HighlightsVec>;

    std::string GetCompactHighlight(const algos::metric::Highlight highlight) const;
    std::string GetCompactHighlights(HighlightsData const&) const;

public:
    algos::AlgorithmType ResolveAlgoType(std::string const& /* algo */) const final {
        return algos::AlgorithmType::metric;
    }

    bool InternalLoadData(db::DataBase const& db, db::ParamsLoader& loader, BaseConfig const& c,
                          pqxx::row const& row) const final;
    bool SaveResults(db::DataBase const& db, BaseConfig const& c) const final;
};
}  // namespace process
