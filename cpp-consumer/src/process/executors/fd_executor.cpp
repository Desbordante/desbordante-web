#include "fd_executor.h"

namespace process {

static std::string GetCompactString(const std::vector<const Column*>& columns) {
    std::vector<std::string> key_cols_indices(columns.size());
    for (const auto* col : columns) {
        key_cols_indices.push_back(std::to_string(col->GetIndex()));
    }
    return boost::algorithm::join(key_cols_indices, ",");
}

std::string GetPieChartData(const std::list<FD>& deps) {
    using SideMap = std::map<unsigned int, double>;
    SideMap lhs_values;
    SideMap rhs_values;

    for (const auto& fd : deps) {
        double divisor = fd.GetLhs().GetArity();

        const auto& lhs_col_indices = fd.GetLhs().GetColumnIndices();
        for (size_t index = lhs_col_indices.find_first(); index != boost::dynamic_bitset<>::npos;
             index = lhs_col_indices.find_next(index)) {
            lhs_values[index] += 1 / divisor;
        }
        size_t index = fd.GetRhs().GetIndex();

        rhs_values[index] = (divisor == 0) ? -1 : rhs_values[index] + 1 / divisor;
    }

    auto get_compact_data = [](const SideMap& map) {
        std::vector<std::string> results;
        results.reserve(map.size());
        for (const auto& [key, value] : map) {
            results.emplace_back(std::to_string(key) + ',' + std::to_string(value));
        }
        return boost::join(results, ";");
    };
    return get_compact_data(lhs_values) + "|" + get_compact_data(rhs_values);
}

bool FDExecutor::SaveResults(db::DataBase const& db, BaseConfig const& c) {
    const auto& fdAlgo = GetAlgoAs<algos::FDAlgorithm>();

    const auto& keys = fdAlgo.GetKeys();
    const auto& deps = fdAlgo.FdList();

    std::string keysStr = GetCompactString(keys);
    std::string depsStr = fdAlgo.GetJsonFDs();
    std::string chartData = GetPieChartData(deps);
    std::string depsAmountStr = std::to_string(deps.size());

    db::Update u{.set = {{R"("PKColumnIndices")", keysStr},
                         {R"("deps")", depsStr},
                         {R"("depsAmount")", depsAmountStr},
                         {R"("withoutPatterns")", chartData}},
                 .table = '"' + c.type + R"(TasksResult")",
                 .conditions = {{R"("taskID")", c.taskID}}};
    db.TransactionQuery(u);
    return true;
}
}  // namespace process
