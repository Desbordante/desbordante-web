#pragma once

#include "../db/TaskConfig.h"
#include "../../src/statistics/CsvStats.h"
#include "../../src/algorithms/AlgoFactory.h"
#include <future>
#include <easylogging++.h>

namespace consumer {

using namespace statistics;

class StatProcessor {
    std::unique_ptr<TaskConfig> task_;
    std::unique_ptr<CsvStats> algo_;

public:
    explicit StatProcessor(std::unique_ptr<TaskConfig> task_config)
        : task_(std::move(task_config)) {
        algo_ = std::make_unique<CsvStats>(algos::details::CreateStatsConfigFromMap(
            task_->GetParamsIntersection()));
    }
    const TaskConfig& GetConfig() const {
        return *task_;
    }

    void Execute();
};

}