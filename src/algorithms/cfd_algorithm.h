#pragma once

#include <utility>

#include "cfd.h"
#include "fd_algorithm.h"
#include "column_layout_partial_relation_data.h"

namespace util {
class AgreeSetFactory;
}

namespace algos {

class CFDAlgorithm : public algos::Primitive {
public:
    using Config = FDAlgorithm::Config;
    using ItemUniverse = model::ColumnLayoutPartialRelationData::ItemNames;

private:
    friend util::AgreeSetFactory;

    std::mutex mutable register_mutex_;

protected:
    const Config config_;
    std::list<model::CFD> cfd_collection_;
    ItemUniverse item_names_;
    std::unique_ptr<model::ColumnLayoutPartialRelationData> relation_;
    virtual unsigned long long ExecuteInternal() = 0;

public:
    constexpr static std::string_view kDefaultPhaseName = "CFD mining";

    explicit CFDAlgorithm(Config const& config, std::vector<std::string_view> phase_names)
        : Primitive(config.data, config.separator, config.has_header, std::move(phase_names)),
          config_(config) {}

    virtual void RegisterCFD(model::TuplePattern lhs, model::ColumnPattern rhs) {
        RegisterCFD({std::move(lhs), rhs});
    }

    virtual void RegisterCFD(model::CFD cfd) {
        if (cfd.GetLhsPattern().Size() > config_.max_lhs) {
            return;
        }
        std::scoped_lock lock(register_mutex_);
        cfd_collection_.emplace_back(std::move(cfd));
    }

    std::list<model::CFD> const& CFDList() const {
        return cfd_collection_;
    }

    std::vector<std::string> CFDListString() const {
        std::vector<std::string> result;
        for (const auto& cfd : CFDList()) {
            result.push_back(cfd.ToString(item_names_));
        }
        return result;
    }

    const ItemUniverse& ItemNames() const {
        return item_names_;
    }

    virtual std::vector<Column const*> GetKeys() const = 0;

    ~CFDAlgorithm() override = default;

    virtual void Initialize() = 0;

    unsigned long long Execute() final;
};

} // namespace algos
