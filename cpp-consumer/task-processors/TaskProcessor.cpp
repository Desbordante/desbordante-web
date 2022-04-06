#include "TaskProcessor.h"

namespace consumer {

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

void TaskProcessor::SaveFdTaskResult() const {
    auto algo = GetAlgoAs<FDAlgorithm>();
    auto key_cols = algo->GetKeys();
    std::vector<std::string> key_cols_indices(key_cols.size());
    for (const auto* col : key_cols) {
        key_cols_indices.push_back(std::to_string(col->GetIndex()));
    }
    std::string pk_column_positions = boost::algorithm::join(key_cols_indices, ",");

    const auto& deps = algo->FdList();
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"pk", pk_column_positions},
                         {"deps", GetCompactDeps<FD>(deps, [](const FD& dep) { return dep.GetLhs().GetArity() != 0; })},
                         {"chart_data_without_patterns", GetPieChartData(deps, 1)},
                         {"deps_amount", std::to_string(deps.size())}});
    std::cout << "params was successfully updated\n";
}

void TaskProcessor::SaveArTaskResult() const {
    auto algo = GetAlgoAs<ARAlgorithm>();
    const auto& deps = algo->GetItemNamesVector();
    const auto& ar_list = algo->GetArIDsList();
    task_->UpdateParams(task_->GetSpecificMapKey(SpecificTablesType::result),
                        {{"value_dictionary", boost::join(deps, ",")},
                         {"deps", GetCompactDeps(ar_list)},
                         {"deps_amount", std::to_string(deps.size())}});
}

void TaskProcessor::SaveResults() const {
    switch (task_->GetPreciseMiningType()) {
    case TaskMiningType::AR:
        SaveArTaskResult();
        break;
    case TaskMiningType::FD:
        SaveFdTaskResult();
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
                         {"phase_name", phase_names_[cur_phase_].data() }});
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
            if (!algo_has_progress_) {
                task_->UpdateParams(BaseTablesType::state, {{"progress", "100"}});
            }
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

void TaskProcessor::Execute() {
    try {
        UpdateProgress();
        task_->UpdateParams(BaseTablesType::state, {{"status", "IN_PROCESS"},
                                                    {"max_phase", std::to_string(max_phase_)}});
        MineDeps();
        if (!task_->IsTaskValid()) {
            throw std::runtime_error("Task isn't valid (Algo was executed successfully");
        } else {
            SaveResults();
            task_->UpdateParams(BaseTablesType::state, {{"is_executed", "true"}});
        }
        std::cout << "Algorithm was successfully executed, results saved\n";
        return;
    } catch (std::runtime_error& e) {
        std::cout << "Error while executing " << e.what() << std::endl;
        throw e;
    }
}

}