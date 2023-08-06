#pragma once

#include <future>
#include <pqxx/pqxx>
#include <string>

#include <easylogging++.h>

#include "algorithms/algo_factory.h"
#include "data/database.h"
#include "data/params_loader.h"

namespace process {

struct BaseConfig {
    std::string fileID;
    std::string taskID;
    std::string algorithmName;
    std::string type;
};

class IExecutor {
    std::unique_ptr<algos::Algorithm> algo_;

    virtual bool InternalLoadData(db::DataBase const& db, db::ParamsLoader& loader,
                                  BaseConfig const& c, pqxx::row const& row) = 0;

public:
    virtual bool HasProgress() const {
        return !algo_->GetPhaseNames().empty();
    }

    virtual unsigned long InternalExecute() {
        return algo_->Execute();
    }

    void SetAlgo(std::unique_ptr<algos::Algorithm> algo) {
        algo_ = std::move(algo);
    }
#if 0
    bool SaveResults(BaseConfig& config, db::DataBase const& db) {
        try {
            return true;
        } catch (std::exception& e) {
            return false;
        }
    }
#endif
    bool LoadData(db::DataBase const& db, db::ParamsLoader& loader, BaseConfig const& c);

    bool Execute(db::DataBase const& db, std::string const& taskID);

    virtual ~IExecutor() = default;
};
}  // namespace process
