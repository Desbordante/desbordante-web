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
    virtual bool InternalLoadData(db::DataBase const& db, db::ParamsLoader& loader,
                                  BaseConfig const& c, pqxx::row const& row) const = 0;

    void UpdateProgress(db::DataBase const& db, std::string const& taskID) const {
        auto const& [curPhase, progress] = algo_->GetProgress();
        auto const& phaseNames = algo_->GetPhaseNames();

        std::string phase_name = HasProgress() ? phaseNames[curPhase].data() : "Data mining";

        db::Update update{.set = {{R"("progress")", std::to_string(progress)},
                                  {R"("currentPhase")", std::to_string(curPhase + 1)},
                                  {R"("phaseName")", phase_name}},
                          .table = R"("TasksState")",
                          .conditions = {{R"("taskID")", taskID}}};
        db.Query(update);
    }

protected:
    std::unique_ptr<algos::Algorithm> algo_;

    template <typename T>
    const T& GetAlgoAs() const {
        return *(static_cast<T*>(algo_.get()));
    }

    template <typename T>
    T& GetAlgoAs() {
        return *(static_cast<T*>(algo_.get()));
    }

public:
    virtual bool HasProgress() const {
        return !algo_->GetPhaseNames().empty();
    }

    virtual unsigned long InternalExecute() {
        return algo_->Execute();
    }

    virtual algos::AlgorithmType ResolveAlgoType(std::string const& algo) const {
        return algos::AlgorithmType::_from_string_nocase(algo.c_str());
    }

    void SetAlgo(std::unique_ptr<algos::Algorithm> algo) {
        algo_ = std::move(algo);
    }
    virtual bool SaveResults(db::DataBase const& db, BaseConfig const& c) const = 0;
    bool LoadData(db::DataBase const& db, db::ParamsLoader& loader, BaseConfig const& c) const;

    bool Execute(db::DataBase const& db, std::string const& taskID);

    virtual ~IExecutor() = default;
};
}  // namespace process
