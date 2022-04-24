#pragma once

#include <list>
#include <utility>
#include <variant>
#include <vector>

#include <boost/dynamic_bitset.hpp>

#include "ColumnLayoutPartialRelationData.h"
#include "PartialPositionListIndex.h"
#include "RelationalSchema.h"
#include "Vertical.h"
#include "TuplePattern.h"

namespace util {

using namespace model;

class CLatticeVertex {
private:
    ColumnLayoutPartialRelationData const* rel_;
    TuplePattern tuple_pattern_;
    std::variant<std::unique_ptr<PartialPositionListIndex>, PartialPositionListIndex const*>
        position_list_index_;
    std::vector<ColumnPattern const*> rhs_candidates_;
    std::vector<CLatticeVertex const*> parents_;

public:
    explicit CLatticeVertex(ColumnLayoutPartialRelationData const* relation,
                            TuplePattern tuple_pattern)
        : rel_(relation), tuple_pattern_(std::move(tuple_pattern)) {}

    auto& GetParents() {
        return parents_;
    }
    const auto& GetTuplePattern() const {
        return tuple_pattern_;
    }
    const auto& GetColumnIndices() const {
        return GetTuplePattern().GetColumnIndices();
    }

    void SetRhsCandidates(std::vector<ColumnPattern const*> const& candidates) {
        rhs_candidates_ = candidates;
    }
    const auto& GetRhsCandidates() const {
        return rhs_candidates_;
    }
    auto& GetRhsCandidates() {
        return rhs_candidates_;
    }

    auto GetSupport() const {
        return GetPositionListIndex()->GetSize();
    }

    const auto& GetPatternValues() const {
        return GetTuplePattern().GetPatternValues();
    }

    bool ComesBeforeAndSharePrefixWith(CLatticeVertex const& rhs) const;

    PartialPositionListIndex const* GetPositionListIndex() const;
    void SetPositionListIndex(PartialPositionListIndex const* pattern_position_list_index) {
        position_list_index_ = pattern_position_list_index;
    }
    void AcquirePositionListIndex(
        std::unique_ptr<PartialPositionListIndex> pattern_position_list_index) {
        position_list_index_ = std::move(pattern_position_list_index);
    }

    const auto* GetColRelation() {
        return rel_;
    }

    bool operator>(CLatticeVertex const& rhs) const;
    bool operator<(CLatticeVertex const& rhs) const {
        return rhs > (*this);
    }

    std::string ToString() const;

    std::string ToStringRhsCandidates(const std::vector<std::string>& item_names = {}) const {
        std::string res;
        for (const auto& candidate : GetRhsCandidates()) {
            res += candidate->ToString(item_names) + ' ';
        }
        return res;
    }

    static bool Comparator(CLatticeVertex* v_1, CLatticeVertex* v_2) {
        return *v_1 < *v_2;
    }

    friend std::ostream& operator<<(std::ostream& os, const CLatticeVertex& lv);

    static std::vector<ColumnPattern const*> IntersectRhsCandidates(
        std::vector<ColumnPattern const*>& lhs, std::vector<ColumnPattern const*>& rhs) {
        std::vector<ColumnPattern const*> intersection;
        std::set_intersection(lhs.begin(), lhs.end(), rhs.begin(), rhs.end(),
                              std::back_inserter(intersection), ColumnPattern::Comparator);
        return intersection;
    }

    static std::vector<int> UnionPatternValues(std::vector<int> const& lhs,
                                               std::vector<int> const& rhs) {
        std::vector<int> res;
        assert(lhs.size() == rhs.size());
        for (size_t idx = 0; idx != lhs.size(); ++idx) {
            res.push_back(std::max(lhs[idx], rhs[idx]));
        }
        return res;
    }
};

} // namespace util
