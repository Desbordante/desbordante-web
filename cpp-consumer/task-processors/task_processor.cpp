#include "task_processor.h"

namespace consumer {

std::string TaskProcessor::GetPieChartData(const std::list<FD>& deps, int degree) {
    std::map<unsigned int, double> lhs_values;
    std::map<unsigned int, double> rhs_values;

    for (const auto& fd : deps) {
        double divisor = std::pow(fd.GetLhs().GetArity(), degree);

        const auto& lhs_col_indices = fd.GetLhs().GetColumnIndices();
        for (size_t index = lhs_col_indices.find_first(); index != boost::dynamic_bitset<>::npos;
             index = lhs_col_indices.find_next(index)) {
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
        for (size_t index = lhs_col_indices.find_first(); index != boost::dynamic_bitset<>::npos;
             index = lhs_col_indices.find_next(index)) {
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

using namespace query;
using namespace fields;

void TaskProcessor::SaveFdTaskResult() const {
    auto algo = GetAlgoAs<FDAlgorithm>();

    const auto& deps = algo->FdList();
    SaveResults({{kPKColumnIndices, GetCompactString(algo->GetKeys())},
                 {kDeps, GetCompactDeps<FD>(deps)},
                 {kWithoutPatterns, GetPieChartData(deps, 1)},
                 {kDepsAmount, std::to_string(deps.size())}});
}

void TaskProcessor::SaveCfdTaskResult() const {
    auto algo = GetAlgoAs<CFDAlgorithm>();
    const auto& item_names = algo->ItemNames();

    const auto& deps = algo->CFDList();
    SaveResults({{kPKColumnIndices, GetCompactString(algo->GetKeys())},
                 {kValueDictionary, boost::join(item_names, ",")},
                 {kDeps, GetCompactDeps<model::CFD>(deps)},
                 {kWithoutPatterns, GetPieChartData(deps, 1)},
                 {kDepsAmount, std::to_string(deps.size())}});
}

void TaskProcessor::SaveArTaskResult() const {
    auto algo = GetAlgoAs<ARAlgorithm>();
    const auto& item_names = algo->GetItemNamesVector();
    const auto& ar_list = algo->GetArIDsList();
    SaveResults({{kValueDictionary, boost::join(item_names, ",")},
                 {kDeps, GetCompactDeps<model::ArIDs>(ar_list)},
                 {kDepsAmount, std::to_string(ar_list.size())}});
}

void TaskProcessor::SaveTypoFdTaskResult() const {
    auto algo = GetAlgoAs<TypoMiner>();
    const auto& typo_fds = algo->GetApproxFDs();
    SaveResults({{kDeps, GetCompactDeps<FD>(typo_fds)},
                 {kPKColumnIndices, GetCompactString(algo->GetKeys())},
                 {kDepsAmount, std::to_string(typo_fds.size())}});
}

void TaskProcessor::SaveStatsResult() const {
    auto algo = GetAlgoAs<DataStats>();
    const auto& stats = algo->GetAllStats();
    for (unsigned i = 0; i < stats.size(); ++i) {
        auto stats_result = stats[i].ToKeyValueMap();
        stats_result.insert(
                {{fields::kFileID, task_->GetFileID()}, {kColumnIndex, std::to_string(i)}});
        GetDBManager()->Send(InsertQuery{tables::kColumnStats, std::move(stats_result)});
    }
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
        default:
            throw std::runtime_error("Unreachable code");
    }
    UpdateState({{kStatus, "COMPLETED"}});
}

void TaskProcessor::UpdateProgress() {
    std::tie(cur_phase_, phase_progress_) = algo_->GetProgress();
    UpdateState({{kProgress, std::to_string(phase_progress_)},
                 {kCurrentPhase, std::to_string(cur_phase_ + 1)},
                 {kPhaseName, phase_names_[cur_phase_].data()}});
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
            LOG(INFO) << "Algorithm was executed";
            UpdateState({{kElapsedTime, std::to_string(elapsed_time)}});
            UpdateProgress();
            UpdateState({{kProgress, "100"}});
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

    auto typo_fd_indices = GetIndicesFromString(task_->GetParam(kTypoFD));

    auto schema = algo->GetRelationData().GetSchema();
    auto bitset =
            schema->IndicesToBitset(typo_fd_indices.cbegin(), std::prev(typo_fd_indices.cend()));

    FD fd(schema->GetVertical(std::move(bitset)), *schema->GetColumn(typo_fd_indices.back()));
    auto clusters_with_typos = algo->FindClustersAndLinesWithTypos(fd);

    auto compact_clusters = GetCompactData<std::pair<std::vector<int>, std::vector<int>>>(
            clusters_with_typos,
            [](const std::pair<std::vector<int>, std::vector<int>>& cluster_with_typos) {
                return GetStringFromIndices(cluster_with_typos.first);
            });
    auto compact_suspicious_indices = GetCompactData<std::pair<std::vector<int>, std::vector<int>>>(
            clusters_with_typos,
            [](const std::pair<std::vector<int>, std::vector<int>>& cluster_with_typos) {
                return GetStringFromIndices(cluster_with_typos.second);
            });
    SaveResults({{kTypoClusters, compact_clusters},
                 {kSuspiciousIndices, compact_suspicious_indices},
                 {kClustersCount, std::to_string(clusters_with_typos.size())}});
}

void TaskProcessor::MineSpecificClusters() {
    auto algo = GetAlgoAs<TypoMiner>();

    auto cluster_id = task_->GetParam<unsigned int>(kClusterID);
    auto clusters_count = task_->GetParam<unsigned int>(kClustersCount);
    if (cluster_id >= clusters_count) {
        throw std::runtime_error("Cluster id must be less than clusters amount");
    }
    auto clusters_str = task_->GetParam(kTypoClusters);

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

    auto typo_fd_indices = GetIndicesFromString(task_->GetParam(kTypoFD));

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

    SaveResults({{kSuspiciousIndices, task_->GetParam(kSuspiciousIndices)},
                 {kSquashedNotSortedCluster, sq_not_sorted},
                 {kSquashedSortedCluster, sq_sorted},
                 {kNotSquashedNotSortedCluster, not_sq_not_sorted},
                 {kNotSquashedSortedCluster, not_sq_sorted},
                 {kNotSquashedItemsAmount, std::to_string(clusters_count)},
                 {kSquashedItemsAmount, std::to_string(squashed_cluster.size())}});
}

void TaskProcessor::Execute() {
    try {
        UpdateProgress();
        UpdateState({{kStatus, "IN_PROCESS"}, {kMaxPhase, std::to_string(max_phase_)}});
        if (task_->GetPreciseMiningType() == +TaskMiningType::TypoCluster) {
            MineClusters();
        } else if (task_->GetPreciseMiningType() == +TaskMiningType::SpecificTypoCluster) {
            MineSpecificClusters();
        } else {
            MineDeps();
        }
        //        if (!task_->IsTaskValid()) {
        //            throw std::runtime_error("Task isn't valid (Algo was executed successfully");
        //        } else
        {
            SaveResults();
            UpdateState({{kIsExecuted, "true"}});
        }
        LOG(INFO) << "Algorithm was successfully executed, results saved\n";
        return;
    } catch (std::runtime_error& e) {
        LOG(INFO) << "Error while executing " << e.what() << std::endl;
        UpdateState(
                {{fields::kStatus, "INTERNAL_SERVER_ERROR"}, {fields::kErrorMsg, e.what()}});
        throw e;
    }
}

}  // namespace consumer
