#pragma once

#include "../db/task_config.h"
#include "algo_factory.h"
#include <future>
#include <easylogging++.h>

namespace consumer {

using namespace algos;

class TaskProcessor {
    std::unique_ptr<TaskConfig> task_;
    std::unique_ptr<algos::Primitive> algo_;

    std::vector<std::string_view> phase_names_{};
    unsigned long max_phase_, cur_phase_;
    double phase_progress_;
    bool algo_has_progress_;

    template <typename IndexType>
    static std::string GetStringFromIndices(const std::vector<IndexType>& indices) {
        std::stringstream ss;
        for (size_t i = 0; i < indices.size(); ++i) {
            if (i != 0) ss << ",";
            ss << indices[i];
        }
        return ss.str();
    }
    template <typename T = unsigned>
    static std::vector<T> GetIndicesFromString(const std::string& data) {
        std::stringstream ss(data);
        std::vector<T> result;
        char ch;
        T tmp;
        while (ss >> tmp) {
            result.emplace_back(tmp);
            ss >> ch;
        }
        return result;
    };

    template <typename C, typename DepType>
    std::string GetCompactDeps(
        const C& deps,
        std::function<bool(const DepType&)> filter = [](const DepType&) { return true; }) const {
        std::vector<std::string> compact_deps;
        for (const auto& dep : deps) {
            if (filter(dep)) {
                compact_deps.push_back(dep.ToCompactString());
            }
        }
        return boost::join(compact_deps, ";");
    }

    template <typename DepType>
    std::string GetCompactData(const std::vector<DepType>& container,
                               std::function<std::string(const DepType&)> ToCompactString) const {
        std::vector<std::string> compact_data;
        for (const auto& item : container) {
            compact_data.emplace_back(ToCompactString(item));
        }
        return boost::join(compact_data, ";");
    }

    template <typename T>
    const T* GetAlgoAs() const {
        return dynamic_cast<const T*>(algo_.get());
    }

    static std::string GetCompactString(const std::vector<const Column *>& columns) {
        std::vector<std::string> key_cols_indices(columns.size());
        for (const auto* col : columns) {
            key_cols_indices.push_back(std::to_string(col->GetIndex()));
        }
        return boost::algorithm::join(key_cols_indices, ",");
    }

    static std::string GetPieChartData(const std::list<FD>& deps, int degree = 1);
    static std::string GetPieChartData(const std::list<model::CFD>& deps, int degree = 1);
//    static std::string GetPieChartDataWithPatterns(const std::list<model::CFD>& deps, int degree = 1);

    void SaveFdTaskResult() const;
    void SaveCfdTaskResult() const;
    void SaveArTaskResult() const;
    void SaveTypoFdTaskResult() const;
    void SaveStatsResult() const;

    void SaveResults() const;
    void UpdateProgress();
    void MineDeps();
    void MineClusters();
    void MineSpecificClusters();

public:
    explicit TaskProcessor(std::unique_ptr<TaskConfig> task_config)
        : task_(std::move(task_config)), cur_phase_(0), phase_progress_(0) {
        LOG(INFO) << "Get algo mining type";
        LOG(INFO) << "Get algo name";
        std::string algo_name = task_->GetAlgoName();
        LOG(INFO) << "Get algo " << algo_name << '\n';
        algo_ = algos::CreatePrimitive(algo_name, task_->GetParamsIntersection());
        LOG(INFO) << "Set algo has progress";
        algo_has_progress_ = !algo_->GetPhaseNames().empty();
        LOG(INFO) << "Phase name init";
        phase_names_ = algo_has_progress_ ? algo_->GetPhaseNames()
                                          : std::vector<std::string_view>{"Data mining"};
        max_phase_ = phase_names_.size();
    }

    const TaskConfig& GetConfig() const {
        return *task_;
    }

    void Execute();
};

}
