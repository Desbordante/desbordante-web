#pragma once

#include <string>

#include "CSVParser.h"
#include "../CFDAlgorithm.h"
#include "PositionListIndex.h"
#include "RelationData.h"
#include "CLatticeVertex.h"
#include "CLatticeLevel.h"

namespace algos {

class CTane : public CFDAlgorithm {
private:
    unsigned long long ExecuteInternal() override;
    double min_conf_;
    unsigned int min_sup_;

    static std::vector<const ColumnPattern*> IntersectCandidates(
        std::vector<const ColumnPattern*>&, std::vector<const ColumnPattern*>&);
    static bool IsExactCfd(util::CLatticeVertex const& x_vertex,
                    util::CLatticeVertex const& xa_vertex) ;
    static double CalculatePartitionError(const util::PatternPositionListIndex& x_pli,
                                   const util::PatternPositionListIndex& xa_pli) ;
    double CalculateConfidence(const util::CLatticeVertex& x_vertex,
                               const util::CLatticeVertex& xa_vertex) const;
    static double CalculateConstConfidence(util::CLatticeVertex const& x_vertex,
                                    util::CLatticeVertex const& xa_vertex) ;
    void RegisterCfd(const TuplePattern& lhs_pattern, const ColumnPattern& rhs_pattern,
                     unsigned supp, double conf);
    void PruneCandidates(util::CLatticeLevel* col_pattern, util::CLatticeVertex const* x_vertex,
                         util::CLatticeVertex const* xa_vertex,
                         ColumnPattern const& rhs_column_pattern) const;
    void Prune(util::CLatticeLevel* level) const;
    void Initialize() final;

public:
    long apriori_millis_ = 0;

    explicit CTane(Config const& config)
        : CFDAlgorithm(config, {kDefaultPhaseName}),
          min_conf_(config.GetSpecialParam<double>("minconf")) {
        min_sup_ = (unsigned int)config.GetSpecialParam<double>("minsup");
    }
};

} // namespace algos