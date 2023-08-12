#pragma once

#include <string>

#include "data/database.h"
#include "data/params_loader.h"
#include "executors/iexecutor.h"

namespace process {

struct TaskProcessor {
private:
    db::DataBase const& db_;
    BaseConfig baseConfig_;
    db::ParamsLoader loader_;

    bool LoadFileInfo();
    bool LoadBaseConfig(const std::string& taskID);

public:
    explicit TaskProcessor(db::DataBase const& db) : db_(db) {}

    bool Process(std::string const& taskID);
};

}  // namespace process
