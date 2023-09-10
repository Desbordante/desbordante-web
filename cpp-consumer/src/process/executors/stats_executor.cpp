#include "stats_executor.h"

#include "algorithms/statistics/statistic.h"

namespace process {

bool StatsExecutor::InternalLoadData(db::DataBase const& /* db */, db::ParamsLoader& loader,
                                     BaseConfig const& /* c */, pqxx::row const& row) const {
    using namespace config::names;
    return loader.SetOptions(row, {{R"("threadsCount")", kThreads}});
}

bool StatsExecutor::SaveResults(db::DataBase const& db, BaseConfig const& c) const {
    const auto& algo = GetAlgoAs<algos::DataStats>();
    const auto& stats = algo.GetAllStats();

    if (stats.empty()) {
        LOG(INFO) << "Received empty 'stats'";
    }
    static std::unordered_set<std::string> supported_keys = {
            R"("fileID")",        R"("columnIndex")", R"("type")",       R"("distinct")",
            R"("isCategorical")", R"("count")",       R"("avg")",        R"("STD")",
            R"("skewness")",      R"("kurtosis")",    R"("min")",        R"("max")",
            R"("sum")",           R"("quantile25")",  R"("quantile50")", R"("quantile75")"};

    using KeyValueMap = std::unordered_map<std::string, std::string>;
    auto collect_keys_value = [&c](const KeyValueMap& map,
                                   std::size_t col_index) -> std::pair<db::KeysVec, db::Value> {
        db::Value v;
        db::KeysVec keys;
        for (auto&& [key, value] : map) {
            std::string db_key = '"' + key + '"';
            if (supported_keys.find(db_key) != supported_keys.end()) {
                keys.emplace_back(db_key);
                v.emplace_back("'" + value + "'");
            }
        }
        keys.emplace_back(R"("fileID")");
        v.emplace_back("'" + c.fileID + "'");
        keys.emplace_back(R"("columnIndex")");
        v.emplace_back("'" + std::to_string(col_index) + "'");

        return {keys, v};
    };

    for (size_t i = 0; i < stats.size(); ++i) {
        const auto& [keys, v] = collect_keys_value(stats[i].ToKeyValueMap(), i);
        db.TransactionQuery(db::Insert{.keys = keys, .values = {v}, .table = R"("ColumnStats")"});
    }

    return true;
}

}  // namespace process
