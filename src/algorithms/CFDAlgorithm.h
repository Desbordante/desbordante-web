#pragma once

#include <utility>

#include "CFD.h"
#include "FDAlgorithm.h"
#include "PatternColumnLayoutRelationData.h"
#include <easylogging++.h>

namespace util {
class AgreeSetFactory;
}

namespace algos {

class CFDAlgorithm : public algos::Primitive {
public:
    using Config = FDAlgorithm::Config;

private:
    friend util::AgreeSetFactory;

    std::mutex mutable register_mutex_;

protected:
    const Config config_;
    std::list<CFD> cfd_collection_;
    std::unordered_map<int, std::string> item_names_;
    std::unique_ptr<PatternColumnLayoutRelationData> relation_;
    virtual unsigned long long ExecuteInternal() = 0;

public:
    constexpr static std::string_view kDefaultPhaseName = "CFD mining";

    explicit CFDAlgorithm(Config const& config, std::vector<std::string_view> phase_names)
        : Primitive(config.data, config.separator, config.has_header, std::move(phase_names)),
          config_(config) {}

    virtual void RegisterCFD(TuplePattern lhs, ColumnPattern rhs) {
        RegisterCFD({std::move(lhs), rhs});
    }

    virtual void RegisterCFD(CFD cfd) {
        if (cfd.GetLhsPattern().Size() > config_.max_lhs) {
            return;
        }
        std::scoped_lock lock(register_mutex_);
        cfd_collection_.emplace_back(std::move(cfd));
    }

    std::list<CFD> const& CFDList() const {
        return cfd_collection_;
    }

    std::vector<std::string> CFDListString() const {
        std::vector<std::string> result;
        for (const auto& cfd : CFDList()) {
            result.push_back(cfd.ToString(item_names_));
        }
        return result;
    }

    void PrintCFDs() const {
        auto CFDs = CFDListString();
        std::sort(CFDs.begin(), CFDs.end(), std::less<>());
        for (const auto& cfd : CFDs) {
            std::cout << cfd << '\n';
        }
    }

    const auto& ItemNames() const {
        return item_names_;
    }

    ~CFDAlgorithm() override = default;

    virtual void Initialize() = 0;

    unsigned long long Execute() final;
};

} // namespace algos
