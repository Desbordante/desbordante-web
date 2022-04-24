#include <algorithm>
#include <chrono>

#include "CLatticeLevel.h"

using boost::dynamic_bitset;

namespace util {

void CLatticeLevel::Add(std::unique_ptr<CLatticeVertex> vertex) {
    vertices_.emplace_back(std::move(vertex));
}

CLatticeVertex* CLatticeLevel::GetLatticeVertex(const TuplePattern& tuple_pattern) const {
    if (vertices_.empty()) {
        return nullptr;
    }
    auto it = std::find_if(vertices_.begin(), vertices_.end(),
                           [&](const std::unique_ptr<CLatticeVertex>& vertex) {
                               return vertex->GetTuplePattern() == tuple_pattern;
                           });
    return it == vertices_.end() ? nullptr : it.base()->get();
}

void CLatticeLevel::GenerateFirstLevel(std::vector<std::unique_ptr<util::CLatticeLevel>>& levels,
                                       const ColumnLayoutPartialRelationData* relation) {
    auto level = std::make_unique<util::CLatticeLevel>(1);
    auto const* empty_vertex = new util::CLatticeVertex(relation, TuplePattern(relation));
    auto col_numbers = relation->GetSchema()->GetNumColumns();
    std::vector<ColumnPattern const*> rhs_candidates;

    for (auto const& rhs_column_patterns : relation->GetColumnData()) {
        for (const auto& [kRhsPatternValue, kPatternColumnData] : rhs_column_patterns) {
            rhs_candidates.emplace_back(
                new ColumnPattern(kPatternColumnData.GetColumn(), kRhsPatternValue));
        }
    }

    for (size_t col_index = 0; col_index != col_numbers; ++col_index) {
        const auto& column_patterns = relation->GetColumnData(col_index);
        auto indices = boost::dynamic_bitset<>(col_numbers).set(col_index);
        for (const auto& [pattern_value, column_pattern_data] : column_patterns) {
            const auto* pli = column_pattern_data.GetPli();
            std::vector<int> pattern_values(col_numbers);
            pattern_values[col_index] = pattern_value;
            auto vertex = std::make_unique<util::CLatticeVertex>(
                relation, TuplePattern(relation, std::move(pattern_values), indices));
            vertex->SetPositionListIndex(pli);
            vertex->GetParents().push_back(empty_vertex);

            auto column_rhs_candidates = rhs_candidates;
            column_rhs_candidates.erase(
                std::remove_if(column_rhs_candidates.begin(), column_rhs_candidates.end(),
                               [&col_index, &vertex](ColumnPattern const* candidate) {
                                   return candidate->GetColumnIndex() == col_index &&
                                          candidate->GetPatternValue() !=
                                              vertex->GetPatternValues()[col_index];
                               }),
                column_rhs_candidates.end());
            vertex->SetRhsCandidates(column_rhs_candidates);
            level->Add(std::move(vertex));
        }
    }
    levels.push_back(std::move(level));
}

void CLatticeLevel::GenerateNextLevel(std::vector<std::unique_ptr<CLatticeLevel>>& levels) {
    unsigned int current_level_index = levels.size() - 1;

    auto* current_level = levels[current_level_index].get();

    std::vector<CLatticeVertex*> current_level_vertices;
    for (const auto& vertex : current_level->GetVertices()) {
        current_level_vertices.push_back(vertex.get());
    }

    std::sort(current_level_vertices.begin(), current_level_vertices.end(),
              CLatticeVertex::Comparator);

    auto next_level = std::make_unique<CLatticeLevel>(current_level_index + 1);
    for (unsigned int vertex_index_1 = 0; vertex_index_1 < current_level_vertices.size();
         vertex_index_1++) {
        auto* vertex_1 = current_level_vertices[vertex_index_1];
        if (vertex_1->GetRhsCandidates().empty()) {
            continue;
        }

        for (unsigned int vertex_index_2 = vertex_index_1 + 1;
             vertex_index_2 < current_level_vertices.size(); vertex_index_2++) {
            auto* vertex_2 = current_level_vertices[vertex_index_2];
            if (!vertex_1->ComesBeforeAndSharePrefixWith(*vertex_2)) {
                continue;
            }
            auto [is_intersects, rhs_candidates_intersection] =
                CLatticeVertex::IntersectRhsCandidates(vertex_1->GetRhsCandidates(),
                                                       vertex_2->GetRhsCandidates());
            if (!is_intersects) {
                continue;
            }
            std::unique_ptr<CLatticeVertex> child_vertex = std::make_unique<CLatticeVertex>(
                vertex_1->GetColRelation(),
                TuplePattern(vertex_1->GetColRelation(),
                             CLatticeVertex::UnionPatternValues(
                                 vertex_1->GetTuplePattern().GetPatternValues(),
                                 vertex_2->GetTuplePattern().GetPatternValues()),
                             vertex_1->GetColumnIndices() | vertex_2->GetColumnIndices()));
            auto& child_rhs_candidates = child_vertex->GetRhsCandidates();

            dynamic_bitset<> parent_indices = vertex_1->GetTuplePattern().GetColumnIndices() |
                                              vertex_2->GetTuplePattern().GetColumnIndices();
            child_rhs_candidates = std::move(rhs_candidates_intersection);
            for (unsigned int i = 0, skip_index = parent_indices.find_first();
                 i < current_level_index; i++, skip_index = parent_indices.find_next(skip_index)) {
                auto* parent_vertex = current_level->GetLatticeVertex(
                    child_vertex->GetTuplePattern().GetWithoutColumn(skip_index));

                if (parent_vertex == nullptr) {
                    goto continueMidOuter;
                }
                std::tie(is_intersects, child_rhs_candidates) =
                    CLatticeVertex::IntersectRhsCandidates(child_rhs_candidates,
                                                           parent_vertex->GetRhsCandidates());
                if (!is_intersects) {
                    goto continueMidOuter;
                }
                child_vertex->GetParents().push_back(parent_vertex);
            }

            child_vertex->GetParents().push_back(vertex_1);
            child_vertex->GetParents().push_back(vertex_2);

            if (!child_rhs_candidates.empty()) {
                next_level->Add(std::move(child_vertex));
            }

        continueMidOuter:
            continue;
        }
    }
    levels.push_back(std::move(next_level));
}

void CLatticeLevel::ClearLevelsBelow(std::vector<std::unique_ptr<CLatticeLevel>>& levels,
                                     unsigned int arity) {
    // Clear the levels from the level list
    auto it = levels.begin();

    for (unsigned int i = 0; i < std::min((unsigned int)levels.size(), arity); i++) {
        (*(it++))->GetVertices().clear();
    }

    // Clear child references
    if (arity < levels.size()) {
        for (auto& retained_vertex : levels[arity]->GetVertices()) {
            retained_vertex->GetParents().clear();
        }
    }
}

} // namespace util
