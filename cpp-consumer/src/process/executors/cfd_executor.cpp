#include "cfd_executor.h"

namespace process {

bool CFDExecutor::InternalLoadData(db::DataBase const& /* db */, db::ParamsLoader& loader,
                                   BaseConfig const& /* c */, pqxx::row const& row) const {
    using namespace config::names;
    return loader.SetOptions(row, {{R"("maxLHS")", kCfdMaximumLhs},
                                   {R"("minSupportCFD")", kCfdMinimumSupport},
                                   {R"("minConfidence")", kCfdMinimumConfidence},
                                   {R"("substrategy")", kCfdSubstrategy}});
}

template <typename It>
static std::string CFDsToJSON(It const& begin, It const& end) {
    std::stringstream ss;
    ss << "[";
    for (auto it = begin; it != end; ++it) {
        if (it != begin) {
            ss << ",";
        }
        ss << it->ToJSON();
    }
    ss << "]";

    return ss.str();
}

static std::string GetPieChartData(const algos::cfd::CFDList& deps, int degree) {
    std::map<unsigned int, double> lhs_values;
    std::map<unsigned int, double> rhs_values;

    for (const auto& cfd : deps) {
        double divisor = std::pow(cfd.GetLhs().size(), degree);

        for (auto item : cfd.GetLhs()) {
            lhs_values[item.attribute] += 1 / divisor;
        }
        algos::cfd::AttributeIndex index = cfd.GetRhs().attribute;

        rhs_values[index] = (divisor == 0) ? -1 : rhs_values[index] + 1 / divisor;
    }

    auto get_compact_data = [](const std::map<unsigned int, double>& map) {
        std::vector<std::string> results;
        results.reserve(map.size());
        for (const auto& [key, value] : map) {
            results.emplace_back(std::to_string(key) + ',' + std::to_string(value));
        }
        return boost::join(results, ";");
    };
    return get_compact_data(lhs_values) + "|" + get_compact_data(rhs_values);
}

bool CFDExecutor::SaveResults(db::DataBase const& db, BaseConfig const& c) const {
    const auto& cfdAlgo = GetAlgoAs<algos::cfd::CFDDiscovery>();
    const auto& deps = cfdAlgo.GetCfds();

    std::string depsStr = CFDsToJSON(deps.begin(), deps.end());
    std::string chartData = GetPieChartData(deps, 1);
    std::string depsAmountStr = std::to_string(deps.size());

    db::Update u{.set = {{R"("deps")", depsStr},
                         {R"("depsAmount")", depsAmountStr},
                         {R"("withoutPatterns")", chartData}},
                 .table = '"' + c.type + R"(TasksResult")",
                 .conditions = {{R"("taskID")", c.taskID}}};
    db.TransactionQuery(u);

    return true;
}

}  // namespace process
