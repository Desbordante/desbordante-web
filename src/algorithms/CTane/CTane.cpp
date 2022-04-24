#include "CTane.h"

#include <chrono>
#include <list>
#include <memory>
#include <easylogging++.h>

#include "RelationalSchema.h"
#include "CLatticeLevel.h"
#include "CLatticeVertex.h"

using namespace util;
using namespace model;

namespace algos {

void CTane::Initialize() {
    if (item_names_.empty() || relation_ == nullptr) {
        std::tie(item_names_, relation_) = ColumnLayoutPartialRelationData::CreateFrom(
            input_generator_, config_.is_null_equal_null, min_sup_);
    }
    if (relation_->GetColumnData().empty()) {
        throw std::runtime_error("Got an empty .csv file: CFD mining is meaningless.");
    }
}

bool CTane::IsExactCfd(const CLatticeVertex& x_vertex, const CLatticeVertex& xa_vertex) {
    const auto& x_pli = x_vertex.GetPositionListIndex();
    const auto& xa_pli = xa_vertex.GetPositionListIndex();
    return x_pli->GetPartitionsNumber() == xa_pli->GetPartitionsNumber() &&
           x_pli->GetSize() == xa_pli->GetSize();
}

double CTane::CalculateConstConfidence(const CLatticeVertex& x_vertex,
                                       const CLatticeVertex& xa_vertex) {
    return (double)xa_vertex.GetSupport() / x_vertex.GetSupport();
}

double CTane::CalculateConfidence(const CLatticeVertex& x_vertex, const CLatticeVertex& xa_vertex) {
    auto error_sum = CalculatePartitionError(*x_vertex.GetPositionListIndex(),
                                             *xa_vertex.GetPositionListIndex());
    return 1 - (double)error_sum / x_vertex.GetSupport();
}

double CTane::CalculatePartitionError(const PartialPositionListIndex& x_pli,
                                      const PartialPositionListIndex& xa_pli) {
    int error_sum = 0;
    std::map<int, unsigned int> partitions_size;
    for (const auto& cluster : xa_pli.GetIndex()) {
        partitions_size[cluster[cluster.size() - 1]] = cluster.size();
    }
    unsigned int max_count = 0;
    int count = 0;

    for (const auto& cluster : x_pli.GetIndex()) {
        for (int row_number : cluster) {
            count++;
            if (partitions_size.count(row_number) && partitions_size[row_number] > max_count) {
                max_count = partitions_size[row_number];
            }
        }
        error_sum += count - (int)max_count;
        max_count = 0;
        count = 0;
    }

    return error_sum;
}

void CTane::RegisterCfd(const TuplePattern& lhs_pattern, const ColumnPattern& rhs_pattern,
                        unsigned supp, double conf) {
    CFD cfd(lhs_pattern, rhs_pattern);
    LOG(INFO) << "Discovered CFD: " << cfd.ToString(ItemNames()) << " with support = " << supp
               << " and confidence = " << conf << ".";
    CFDAlgorithm::RegisterCFD(std::move(cfd));
}

void CTane::PruneCandidates(CLatticeLevel* level, const CLatticeVertex* x_vertex,
                            const CLatticeVertex* xa_vertex,
                            ColumnPattern const& rhs_column_pattern) const {
    // otherIndices = { idx : idx in R\X }
    auto other_indices = ~boost::dynamic_bitset<>(relation_->GetSchema()->GetNumColumns()) -
                         x_vertex->GetColumnIndices();

    auto rhs_col_index = rhs_column_pattern.GetColumnIndex();
    auto xa_vertex_without_col = xa_vertex->GetTuplePattern().GetWithoutColumn(rhs_col_index);

    for (const auto& vertex : level->GetVertices()) {
        const auto& tuple_pattern = vertex->GetTuplePattern();
        if (tuple_pattern.HasColumnPattern(rhs_column_pattern) &&
            tuple_pattern.GetWithoutColumn(rhs_col_index) <= xa_vertex_without_col) {
            auto& candidates = vertex->GetRhsCandidates();
            candidates.erase(std::remove_if(candidates.begin(), candidates.end(),
                                            [&other_indices, &rhs_column_pattern](
                                                const ColumnPattern* col_pattern) {
                                                return *col_pattern == rhs_column_pattern ||
                                                       other_indices[col_pattern->GetColumnIndex()];
                                            }),
                             vertex->GetRhsCandidates().end());
        }
    }
}

void CTane::Prune(CLatticeLevel* level) const {
    auto& level_vertices = level->GetVertices();
    level_vertices.erase(
        std::remove_if(level_vertices.begin(), level_vertices.end(),
                       [&](std::unique_ptr<CLatticeVertex>& vertex) {
                           return vertex->GetRhsCandidates().empty() ||
                                  (vertex->GetPositionListIndex()->GetSize() < min_sup_);
                       }),
        level_vertices.end());
}

unsigned long long CTane::ExecuteInternal() {
    unsigned int levels_amount =
        std::min(config_.max_lhs, (unsigned int)relation_->GetSchema()->GetNumColumns() - 1) + 1;
    double progress_step = 100.0 / (levels_amount);
    auto start_time = std::chrono::system_clock::now();

    std::vector<std::unique_ptr<CLatticeLevel>> levels;

    for (unsigned int arity = 0; arity < levels_amount; arity++) {
        if (arity == 0) {
            CLatticeLevel::GenerateFirstLevel(levels, relation_.get());
        } else {
            CLatticeLevel::GenerateNextLevel(levels);
        }

        auto* level = levels[arity].get();
        LOG(DEBUG) << "Checking " << level->GetVertices().size() << " " << arity
                   << "-ary lattice vertices.";

        if (level->GetVertices().empty()) {
            break;
        }

        for (auto& xa : level->GetVertices()) {
            if (arity == 0) {
                // TODO(chizhov): Добавить проверку для CFD вида empty -> A
                continue;
            }
            if (!xa->GetPositionListIndex()) {
                auto pli_1 = xa->GetParents()[0]->GetPositionListIndex();
                auto pli_2 = xa->GetParents()[1]->GetPositionListIndex();
                xa->AcquirePositionListIndex(pli_1->Intersect(pli_2));
                if (xa->GetPositionListIndex()->GetSize() < min_sup_) {
                    continue;
                }
            }
            for (const auto x : xa->GetParents()) {
                auto a_index = (xa->GetColumnIndices() - x->GetColumnIndices()).find_first();
                auto a = xa->GetTuplePattern().GetAsColumnPattern(a_index);
                if (std::find_if(xa->GetRhsCandidates().begin(), xa->GetRhsCandidates().end(),
                                 [&a](const ColumnPattern* col) {
                                     return col->ToString() == a->ToString();
                                 }) != xa->GetRhsCandidates().end()) {
                    double conf = min_conf_ == 1 ? IsExactCfd(*x, *xa)
                                  : a->IsConst() ? CalculateConstConfidence(*x, *xa)
                                                 : CalculateConfidence(*x, *xa);

                    if (conf >= min_conf_) {
                        RegisterCfd(x->GetTuplePattern(), *a, xa->GetSupport(), conf);
                    }
                    if (conf == 1) {
                        PruneCandidates(level, x, xa.get(), *a);
                    }
                }
            }
        }
        Prune(level);
        AddProgress(progress_step);
        LOG(INFO) << "Current phase & progress: " << GetPhaseNames()[GetProgress().first] << ", "
                  << GetProgress().second;
    }

    SetProgress(100);

    auto elapsed_milliseconds = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now() - start_time);
    apriori_millis_ += elapsed_milliseconds.count();

    LOG(INFO) << "Found " << cfd_collection_.size() << " CFDs";
    return apriori_millis_;
}

} // namespace algos
