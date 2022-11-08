#pragma once

#include <string>

#include "csv_parser.h"
#include "../cfd_algorithm.h"
#include "position_list_index.h"
#include "relation_data.h"
#include "c_lattice_vertex.h"
#include "c_lattice_level.h"

namespace algos {

class CTane : public CFDAlgorithm {
private:
    std::vector<Column const *> keys_;

    unsigned long long ExecuteInternal() override;
    double min_conf_;
    unsigned int min_sup_;

    static bool IsExactCfd(util::CLatticeVertex const& x_vertex,
                           util::CLatticeVertex const& xa_vertex) ;
    static double CalculatePartitionError(const util::PartialPositionListIndex& x_pli,
                                          const util::PartialPositionListIndex& xa_pli) ;
    static double CalculateConfidence(const util::CLatticeVertex& x_vertex,
                                      const util::CLatticeVertex& xa_vertex) ;
    static double CalculateConstConfidence(util::CLatticeVertex const& x_vertex,
                                           util::CLatticeVertex const& xa_vertex) ;
    void RegisterCfd(const model::TuplePattern& lhs_pattern, const model::ColumnPattern& rhs_pattern,
                     unsigned supp, double conf);
    void PruneCandidates(util::CLatticeLevel* col_pattern, util::CLatticeVertex const* x_vertex,
                         util::CLatticeVertex const* xa_vertex,
                         model::ColumnPattern const& rhs_column_pattern) const;
    void Prune(util::CLatticeLevel* level) const;
    void Initialize() final;

    std::vector<Column const *> GetKeys() const final { return keys_; }

public:
    long apriori_millis_ = 0;

    explicit CTane(Config const& config)
        : CFDAlgorithm(config, {kDefaultPhaseName}),
          min_conf_(config.GetSpecialParam<double>("minconf")) {
        min_sup_ = (unsigned int)config.GetSpecialParam<double>("minsup");
    }
};

} // namespace algos