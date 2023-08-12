#include "mfd_executor.h"

#include "util/parse.h"

namespace process {

bool MFDExecutor::InternalLoadData(db::DataBase const& /* db */, db::ParamsLoader& loader,
                                   BaseConfig const& /* c */, pqxx::row const& row) const {
    using namespace util;
    using namespace config::names;

    bool distanceToNullIsInfinity = row[R"("distanceToNullIsInfinity)"].as<bool>();
    std::vector<std::string> lhsIndices = GetIndicesStrsFromString(row[R"("lhsIndices)"].c_str());
    std::vector<std::string> rhsIndices = GetIndicesStrsFromString(row[R"("rhsIndices)"].c_str());

    return loader.SetOption(kDistFromNullIsInfinity, std::to_string(distanceToNullIsInfinity)) &&
           loader.SetOption(kLhsIndices, lhsIndices) && loader.SetOption(kRhsIndices, rhsIndices) &&
           loader.SetOptions(row, {{R"("parameter")", kParameter},
                                   {R"("q")", kQGramLength},
                                   {R"("metric")", kMetric},
                                   {R"("metricAlgorithm")", kMetricAlgorithm}});
}

std::string MFDExecutor::GetCompactHighlight(const algos::metric::Highlight highlight) const {
    using namespace algos::metric;
    const auto& algo = GetAlgoAs<MetricVerifier>();
    auto parameter = algo.GetParameter();

    std::vector<std::string> compact_highlight = {
            std::to_string(highlight.max_distance <= parameter),
            std::to_string(highlight.data_index),
            std::to_string(highlight.furthest_data_index),
            std::to_string(highlight.max_distance),
    };

    return boost::join(compact_highlight, ";");
}

std::string MFDExecutor::GetCompactHighlights(HighlightsData const& highlights) const {
    using namespace algos::metric;
    std::vector<std::string> compact_data;

    for (const auto& cluster_highlights : highlights) {
        std::vector<std::string> compact_cluster_data;
        for (const auto& highlight : cluster_highlights) {
            compact_cluster_data.emplace_back(GetCompactHighlight(highlight));
        }
        compact_data.emplace_back(boost::join(compact_cluster_data, "\n"));
    }

    return boost::join(compact_data, "\n\n");
}

bool MFDExecutor::SaveResults(db::DataBase const& db, BaseConfig const& c) const {
    using namespace algos::metric;
    const auto& algo = GetAlgoAs<MetricVerifier>();

    HighlightsData const& highlights = algo.GetHighlights();

    db::Update u{.set = {{R"("result")", std::to_string(algo.GetResult())},
                         {R"("deps")", GetCompactHighlights(highlights)},
                         {R"("depsAmount")", std::to_string(highlights.size())}},
                 .table = '"' + c.type + R"(TasksResult")",
                 .conditions = {{R"("taskID")", c.taskID}}};
    db.TransactionQuery(u);
    return true;
}

}  // namespace process
