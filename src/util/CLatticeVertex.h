#pragma once

#include <list>
#include <utility>
#include <variant>
#include <vector>
#include <easylogging++.h>

#include <boost/dynamic_bitset.hpp>

#include "PatternColumnLayoutRelationData.h"
#include "PatternPositionListIndex.h"
#include "RelationalSchema.h"
#include "Vertical.h"
#include "TuplePattern.h"

namespace util {

class CLatticeVertex{
private:
    PatternColumnLayoutRelationData const* rel_;
    TuplePattern tuple_pattern_;
    std::variant<std::unique_ptr<PatternPositionListIndex>, PatternPositionListIndex const*>
        position_list_index_;
    std::vector<ColumnPattern const *> rhs_candidates_;
    std::vector<CLatticeVertex const*> parents_;

public:
    explicit CLatticeVertex(PatternColumnLayoutRelationData const* relation, TuplePattern tuple_pattern)
        : rel_(relation), tuple_pattern_(std::move(tuple_pattern)) {}

    auto& GetParents() { return parents_; }
    const auto& GetTuplePattern() const { return tuple_pattern_; }
    const auto& GetColumnIndices() const { return GetTuplePattern().GetColumnIndices(); }

    void SetRhsCandidates(std::vector<ColumnPattern const *> const& candidates) {
        rhs_candidates_ = candidates;
    }
    const auto& GetRhsCandidates() const { return rhs_candidates_; }
    auto& GetRhsCandidates() { return rhs_candidates_; }

    auto GetSupport() const {
        return GetPositionListIndex()->GetSize();
    }

    const auto& GetPatternValues() const {
        return GetTuplePattern().GetPatternValues();
    }

    bool ComesBeforeAndSharePrefixWith(CLatticeVertex const& rhs) const;

    PatternPositionListIndex const* GetPositionListIndex() const;
    void SetPositionListIndex(PatternPositionListIndex const* pattern_position_list_index) {
        position_list_index_ = pattern_position_list_index;
    }
    void acquirePositionListIndex(std::unique_ptr<PatternPositionListIndex> pattern_position_list_index) {
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

    std::string ToStringRhsCandidates(const std::unordered_map<int, std::string>& item_names = {}) const {
        std::string res;
        for (const auto& candidate : GetRhsCandidates()) {
            res += candidate->ToString(item_names) + ' ';
        }
        return res;
    }

    static bool Comparator(CLatticeVertex * v_1, CLatticeVertex * v_2) {
        return *v_1 < *v_2;
    }

    friend std::ostream& operator<<(std::ostream& os, const CLatticeVertex& lv);

    static std::pair<bool, std::vector<ColumnPattern const *>> IntersectRhsCandidates(
            std::vector<ColumnPattern const *>& lhs, std::vector<ColumnPattern const *>& rhs) {
        std::vector<ColumnPattern const *> intersection;
        auto comparator =
                [](ColumnPattern const *cp1, ColumnPattern const *cp2) {
                if (cp1->GetColumnIndex() != cp2->GetColumnIndex()) {
                    return cp1->GetColumnIndex() < cp2->GetColumnIndex();
                }
                if (cp1->IsVar()) {
                    return !cp2->IsVar();
                } else if (cp2->IsVar()) {
                    return false;
                } else {
                    return cp1->GetPatternValue() < cp2->GetPatternValue();
                }
            };
        std::sort(lhs.begin(), lhs.end(), comparator);
        std::sort(rhs.begin(), rhs.end(), comparator);

        std::set_intersection(lhs.begin(), lhs.end(),
                              rhs.begin(), rhs.end(),
                              std::back_inserter(intersection), comparator);
        return { !intersection.empty(), std::move(intersection) };
    }

    static std::vector<int> UnionPatternValues(
            std::vector<int> const& lhs, std::vector<int> const& rhs) {
        std::vector<int> res;
        assert(lhs.size() == rhs.size());
        for (size_t idx = 0; idx != lhs.size(); ++idx) {
            res.push_back(std::max(lhs[idx], rhs[idx]));
        }
        return res;
    }
};

} // namespace util

