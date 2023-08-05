#include "task_processor.h"

namespace consumer {

std::string TaskProcessor::GetCompactHighlight(const algos::metric::MetricVerifier* algo,
                                               const algos::metric::Highlight highlight) const {
    std::vector<std::string> compact_highlight;
    auto parameter = algo->GetParameter();

    compact_highlight.emplace_back(std::to_string(highlight.max_distance <= parameter));
    compact_highlight.emplace_back(std::to_string(highlight.data_index));
    compact_highlight.emplace_back(std::to_string(highlight.furthest_data_index));
    compact_highlight.emplace_back(std::to_string(highlight.max_distance));

    return boost::join(compact_highlight, ";");
}

std::string TaskProcessor::GetCompactHighlights(const algos::metric::MetricVerifier* algo) const {
    std::vector<std::vector<algos::metric::Highlight>> const& highlights = algo->GetHighlights();
    std::vector<std::string> compact_data;

    for (const auto& cluster_highlights : highlights) {
        std::vector<std::string> compact_cluster_data;
        for (const auto& highlight : cluster_highlights) {
            compact_cluster_data.emplace_back(GetCompactHighlight(algo, highlight));
        }
        compact_data.emplace_back(boost::join(compact_cluster_data, "\n"));
    }

    return boost::join(compact_data, "\n\n");
}

std::string TaskProcessor::GetPieChartData(const std::list<FD>& deps, int degree) {
    std::map<unsigned int, double> lhs_values;
    std::map<unsigned int, double> rhs_values;

    for (const auto& fd : deps) {
        double divisor = std::pow(fd.GetLhs().GetArity(), degree);

        const auto& lhs_col_indices = fd.GetLhs().GetColumnIndices();
        for (size_t index = lhs_col_indices.find_first();
             index != boost::dynamic_bitset<>::npos; index = lhs_col_indices.find_next(index)) {
            lhs_values[index] += 1 / divisor;
        }
        size_t index = fd.GetRhs().GetIndex();

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

std::string TaskProcessor::GetPieChartData(const std::list<model::CFD>& deps, int degree) {
    std::map<unsigned int, double> lhs_values;
    std::map<unsigned int, double> rhs_values;

    for (const auto& fd : deps) {
        double divisor = std::pow(fd.GetLhsPattern().Size(), degree);

        const auto& lhs_col_indices = fd.GetLhsPattern().GetColumnIndices();
        for (size_t index = lhs_col_indices.find_first();
             index != boost::dynamic_bitset<>::npos; index = lhs_col_indices.find_next(index)) {
            lhs_values[index] += 1 / divisor;
        }
        size_t index = fd.GetRhsPattern().GetColumn()->GetIndex();

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

//std::string TaskProcessor::GetPieChartDataWithPatterns(const std::list<model::CFD>& deps, int degree) {
//    // TODO(implement)
//}


void TaskProcessor::SaveFdTaskResult() const {
    auto algo = GetAlgoAs<FDAlgorithm>();

    const auto& deps = algo->FdList();
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"pk", GetCompactString(algo->GetKeys())},
                         {"deps", GetCompactDeps<const std::list<FD>&, FD>(deps)},
                         {"chart_data_without_patterns", GetPieChartData(deps, 1)},
                         {"deps_amount", std::to_string(deps.size())}});
    std::cout << "params was successfully updated\n";
}

void TaskProcessor::SaveCfdTaskResult() const {
    auto algo = GetAlgoAs<CFDAlgorithm>();
    const auto& item_names = algo->ItemNames();

    const auto& deps = algo->CFDList();
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"pk", GetCompactString(algo->GetKeys())},
                         {"value_dictionary", boost::join(item_names, ",")},
                         {"deps", GetCompactDeps<const std::list<model::CFD>&, model::CFD>(deps)},
                         {"chart_data_without_patterns", GetPieChartData(deps, 1)},
//                         {"chart_data_with_patterns", GetPieChartDataWithPatterns(deps, 1)},
                         {"deps_amount", std::to_string(deps.size())}});
    std::cout << "params was successfully updated\n";
}

void TaskProcessor::SaveMfdTaskResult() const {
    auto algo = GetAlgoAs<algos::metric::MetricVerifier>();
    const bool result = algo->GetResult();
    std::vector<std::vector<algos::metric::Highlight>> const& highlights = algo->GetHighlights();

    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"result", std::to_string(result)},
                         {"deps", GetCompactHighlights(algo)},
                         {"deps_amount", std::to_string(highlights.size())}});
}

void TaskProcessor::SaveArTaskResult() const {
    auto algo = GetAlgoAs<ARAlgorithm>();
    const auto& item_names = algo->GetItemNamesVector();
    const auto& ar_list = algo->GetArIDsList();
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"value_dictionary", boost::join(item_names, ",")},
                         {"deps", GetCompactDeps<const std::list<model::ArIDs>, model::ArIDs>(ar_list)},
                         {"deps_amount", std::to_string(ar_list.size())}});
}

void TaskProcessor::SaveTypoFdTaskResult() const {
    auto algo = GetAlgoAs<TypoMiner>();
    const auto& typo_fds = algo->GetApproxFDs();
    LOG(INFO) << "Update params for typo fd result";
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"deps", GetCompactDeps<const std::vector<FD>&, FD>(typo_fds)},
                         {"pk", GetCompactString(algo->GetKeys())},
                         {"deps_amount", std::to_string(typo_fds.size())}});
}

void TaskProcessor::SaveStatsResult() const {
    auto algo = GetAlgoAs<DataStats>();
    const auto& stats = algo->GetAllStats();
    const std::string file_id = task_->GetParam("fileID");
    LOG(INFO) << "Insert params for stats result";
    for(unsigned i = 0; i < stats.size(); ++i) {
        auto stats_result = stats[i].ToKeyValueMap();
        stats_result.insert({{"fileID", file_id}, {"columnIndex", std::to_string(i)}});
        task_->GetDBManager()->SendInsertQuery(stats_result, "ColumnStats");
    }
    LOG(INFO) << "Stats was successfully calculated, results saved\n";
}

void TaskProcessor::SaveResults() const {
    switch (task_->GetPreciseMiningType()) {
    case TaskMiningType::AR:
        SaveArTaskResult();
        break;
    case TaskMiningType::FD:
        SaveFdTaskResult();
        break;
    case TaskMiningType::CFD:
        SaveCfdTaskResult();
        break;
    case TaskMiningType::TypoFD:
        SaveTypoFdTaskResult();
        break;
    case TaskMiningType::TypoCluster:
    case TaskMiningType::SpecificTypoCluster:
        break;
    case TaskMiningType::Stats:
        SaveStatsResult();
        break;
    case TaskMiningType::MFD:
        SaveMfdTaskResult();
        break;
    default:
        throw std::runtime_error("Not implemented yet");
    }
    task_->UpdateParams(BaseTablesType::state, {{"status", "COMPLETED"}});
}

void TaskProcessor::UpdateProgress() {
    std::tie(cur_phase_, phase_progress_) = algo_->GetProgress();
    task_->UpdateParams(BaseTablesType::state,
                        {{"progress", std::to_string(phase_progress_)},
                         {"current_phase", std::to_string(cur_phase_ + 1)},
                         {"phase_name", phase_names_[cur_phase_].data()}});
}

void TaskProcessor::MineDeps() {
    unsigned long elapsed_time;
    auto execution_thread = std::async(std::launch::async, [this, &elapsed_time]() -> void {
        elapsed_time = algo_->Execute();
    });
    std::future_status status;
    do {
        status = execution_thread.wait_for(std::chrono::seconds(0));
        if (status == std::future_status::ready) {
            std::cout << "Algorithm was executed" << std::endl;
            task_->UpdateParams(BaseTablesType::state,
                                {{"elapsed_time", std::to_string(elapsed_time)}});
            UpdateProgress();
            task_->UpdateParams(BaseTablesType::state, {{"progress", "100"}});
        } else if (status == std::future_status::timeout) {
            if (algo_has_progress_) {
                UpdateProgress();
            }
        } else {
            throw std::runtime_error("Main thread: unknown future_status");
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    } while (status != std::future_status::ready);
}

void TaskProcessor::MineClusters() {
    auto algo = GetAlgoAs<TypoMiner>();

    auto typo_fd_indices = GetIndicesFromString(task_->GetParam("typo_fd"));

    auto schema = algo->GetRelationData().GetSchema();
    auto bitset = schema->IndicesToBitset(typo_fd_indices.cbegin(),
                                          std::prev(typo_fd_indices.cend()));

    FD fd(schema->GetVertical(std::move(bitset)), *schema->GetColumn(typo_fd_indices.back()));
    auto clusters_with_typos = algo->FindClustersAndLinesWithTypos(fd);

    auto compact_clusters =
        GetCompactData<std::pair<std::vector<int>, std::vector<int>>>(
            clusters_with_typos,
            [](const std::pair<std::vector<int>, std::vector<int>>& cluster_with_typos) {
                return GetStringFromIndices(cluster_with_typos.first);
            });
    auto compact_suspicious_indices =
        GetCompactData<std::pair<std::vector<int>, std::vector<int>>>(
            clusters_with_typos,
            [](const std::pair<std::vector<int>, std::vector<int>>& cluster_with_typos) {
                return GetStringFromIndices(cluster_with_typos.second);
            });
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"typo_clusters", compact_clusters},
                         {"suspicious_indices", compact_suspicious_indices},
                         {"clusters_count", std::to_string(clusters_with_typos.size())}});
}

void TaskProcessor::MineSpecificClusters() {
    auto algo = GetAlgoAs<TypoMiner>();

    auto cluster_id = task_->GetParam<unsigned int>("cluster_id");
    auto clusters_count = task_->GetParam<unsigned int>("clusters_count");
    if (cluster_id >= clusters_count) {
        throw std::runtime_error("Cluster id must be less than clusters amount");
    }
    auto clusters_str = task_->GetParam("typo_clusters");

    std::stringstream ss(clusters_str);
    unsigned int count = 0;
    std::string not_sq_sorted;
    while (ss.good()) {
        getline(ss, not_sq_sorted, ';');
        if (count++ == cluster_id) {
            break;
        }
    }
    util::PLI::Cluster cluster = GetIndicesFromString<int>(not_sq_sorted);
    if (cluster.empty()) {
        throw std::runtime_error("Received empty cluster");
    }

    auto typo_fd_indices = GetIndicesFromString(task_->GetParam("typo_fd"));

    auto schema = algo->GetRelationData().GetSchema();
    auto bitset =
        schema->IndicesToBitset(typo_fd_indices.cbegin(), std::prev(typo_fd_indices.cend()));

    FD fd(schema->GetVertical(std::move(bitset)), *schema->GetColumn(typo_fd_indices.back()));

    auto squashed_cluster = algo->SquashCluster(fd, cluster);

    auto to_compact_string = [](const TypoMiner::SquashedElement& element) {
        return std::to_string(element.tuple_index) + "," + std::to_string(element.amount);
    };
    auto sq_sorted =
        GetCompactData<TypoMiner::SquashedElement>(squashed_cluster, to_compact_string);
    algo->RestoreLineOrder(squashed_cluster);

    auto sq_not_sorted =
        GetCompactData<TypoMiner::SquashedElement>(squashed_cluster, to_compact_string);

    algo->RestoreLineOrder(cluster);
    std::string not_sq_not_sorted = GetStringFromIndices(cluster);

    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"suspicious_indices", task_->GetParam("suspicious_indices")},
                         {"sq_not_sorted", sq_not_sorted},
                         {"sq_sorted", sq_sorted},
                         {"not_sq_not_sorted", not_sq_not_sorted},
                         {"not_sq_sorted", not_sq_sorted},
                         {"not_sq_amount", std::to_string(clusters_count)},
                         {"sq_amount", std::to_string(squashed_cluster.size())}});
}

void TaskProcessor::Execute() {
    try {
        UpdateProgress();
        task_->UpdateParams(BaseTablesType::state, {{"status", "IN_PROCESS"},
                                                    {"max_phase", std::to_string(max_phase_)}});
        if (task_->GetPreciseMiningType() == +TaskMiningType::TypoCluster) {
            MineClusters();
        } else if (task_->GetPreciseMiningType() == +TaskMiningType::SpecificTypoCluster) {
            MineSpecificClusters();
        } else {
            MineDeps();
        }
        if (!task_->IsTaskValid()) {
            throw std::runtime_error("Task isn't valid (Algo was executed successfully");
        } else {
            SaveResults();
            task_->UpdateParams(BaseTablesType::state, {{"is_executed", "true"}});
        }
        LOG(INFO) << "Algorithm was successfully executed, results saved\n";
        return;
    } catch (std::runtime_error& e) {
        LOG(INFO) << "Error while executing " << e.what() << std::endl;
        throw e;
    }
}

}
