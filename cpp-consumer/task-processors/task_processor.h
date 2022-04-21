#pragma once

#include "../db/task_config.h"
#include "algo_factory.h"
#include <future>

namespace consumer {

using namespace algos;

const static std::map<consumer::TaskMiningType, AlgoMiningType> mining_type_resolution {
    { TaskMiningType::AR, AlgoMiningType::ar },
//    { TaskMiningType::CFD, AlgoMiningType::cfd },
    { TaskMiningType::FD, AlgoMiningType::fd },
    { TaskMiningType::SpecificTypoCluster, AlgoMiningType::typos },
    { TaskMiningType::TypoCluster, AlgoMiningType::typos },
    { TaskMiningType::TypoFD, AlgoMiningType::typos },
};

const static std::map<std::string, Algo> algo_name_resolution {
    {"Pyro", Algo::pyro}, {"Dep Miner", Algo::depminer}, {"TaneX", Algo::tane},
    {"FastFDs", Algo::fastfds}, {"FD mine", Algo::fdmine}, {"DFD", Algo::dfd},
    {"FDep", Algo::fdep}, { "Apriori", Algo::apriori },
    {"Typo Miner", Algo::typominer}, {"Typo Cluster Miner", Algo::typominer}
};

class TaskProcessor {
    std::unique_ptr<TaskConfig> task_;
    std::unique_ptr<algos::Primitive> algo_;

    std::vector<std::string_view> phase_names_{};
    unsigned long max_phase_, cur_phase_;
    double phase_progress_;
    bool algo_has_progress_;

    template <typename DepType>
    std::string GetCompactDeps(
        const std::list<DepType>& deps,
        std::function<bool(const DepType&)> filter = [](const DepType&) { return true; }) const {
        std::vector<std::string> compact_deps;
        for (const auto& dep : deps) {
            if (filter(dep)) {
                compact_deps.push_back(dep.ToCompactString());
            }
        }
        return boost::join(compact_deps, ";");
    }

    template <typename T>
    const T* GetAlgoAs() const {
        return dynamic_cast<const T*>(algo_.get());
    }

    static std::string GetPieChartData(const std::list<FD>& deps, int degree = 1);

    void SaveFdTaskResult() const;
    void SaveArTaskResult() const;

    void SaveResults() const;
    void UpdateProgress();
    void MineDeps();

public:
    explicit TaskProcessor(std::unique_ptr<TaskConfig> task_config)
        : task_(std::move(task_config)), cur_phase_(0), phase_progress_(0) {
        const auto& algo_mining_type = mining_type_resolution.at(task_->GetPreciseMiningType());
        const auto& algo_name = algo_name_resolution.at(task_->GetParam<std::string>("algo_name"));
        algo_ = algos::CreateAlgorithmInstance(algo_mining_type, algo_name,
                                               task_->GetParamsIntersection());
        algo_has_progress_ = !algo_->GetPhaseNames().empty();
        phase_names_ =
            algo_has_progress_
                ? algo_->GetPhaseNames()
                : std::vector<std::string_view>{"Dependencies mining"};
        max_phase_ = phase_names_.size();
    }

    const TaskConfig& GetConfig() const {
        return *task_;
    }

    void Execute();
};

}