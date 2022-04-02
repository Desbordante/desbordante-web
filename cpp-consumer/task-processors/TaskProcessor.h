#pragma once

#include "../db/TaskConfig.h"
#include "AlgoFactory.h"
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

    template <typename PrimitiveType>
    std::string GetCompactDeps(
        const std::list<PrimitiveType>& deps, std::function<bool(const PrimitiveType&)> filter =
                                                  [](const PrimitiveType&) { return true; }) {
        std::vector<std::string> compact_deps;
        for (const auto& dep : deps) {
            if (filter(dep)) {
                compact_deps.push_back(dep.ToCompactString());
            }
        }
        return boost::join(compact_deps, ";");
    }
    template <typename T>
    const T* GetAlgoAs() {
        return dynamic_cast<T*>(algo_.get());
    }

    std::string GetCompactFDs(const std::list<FD>& deps);
    std::string GetCompactARs(const std::list<model::ArIDs>& deps);
    std::string GetPieChartData(const std::list<FD>& deps, int degree = 1);

    void SaveFdTaskResult();
    void SaveArTaskResult();

    void SaveResults();
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
        phase_names_ = algo_has_progress_ ? algo_->GetPhaseNames()
                                          : std::vector<std::string_view>{task_->GetPreciseMiningType()._to_string() + std::string("s mining")};
        max_phase_ = phase_names_.size();
    }

    void Execute();
};

}