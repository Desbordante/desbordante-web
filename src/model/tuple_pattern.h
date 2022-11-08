#pragma once
#include <algorithm>

#include <boost/dynamic_bitset.hpp>
#include <utility>

#include "column_layout_partial_relation_data.h"

namespace model {

class ColumnPattern {
    const Column* col_;
    int pattern_value_;

public:
    ColumnPattern(const Column* col, int pattern_value)
        : col_(col), pattern_value_(pattern_value) {}

    const auto& GetPatternValue() const {
        return pattern_value_;
    }

    bool IsConst() const {
        return pattern_value_ != 0;
    }

    bool IsVar() const {
        return !IsConst();
    }

    std::string GetColumnName() const {
        return col_->GetName();
    }

    auto GetColumnIndex() const {
        return col_->GetIndex();
    }

    Column const* GetColumn() const {
        return col_;
    }

    std::string ToString(const std::vector<std::string>& item_names = {}) const {
        std::string res;
        res += GetColumnName() + "=";
        res +=
            item_names.empty() ? std::to_string(GetPatternValue()) : item_names[GetPatternValue()];
        res += "";
        return res;
    }

    std::string ToStringOnlyIndices() const {
        std::string res;
        res.append(std::to_string(GetColumnIndex()));
        res.append("=" + std::to_string(GetPatternValue()));
        return res;
    }

    bool operator==(const ColumnPattern& rhs) const {
        return GetColumnIndex() == rhs.GetColumnIndex() &&
               GetPatternValue() == rhs.GetPatternValue();
    }

    bool operator<=(const ColumnPattern& rhs) const {
        return GetColumnIndex() == rhs.GetColumnIndex() &&
               (GetPatternValue() == rhs.GetPatternValue() || !rhs.GetPatternValue());
    }

    static bool Comparator(ColumnPattern const* lhs, ColumnPattern const* rhs) {
        if (lhs->GetColumnIndex() != rhs->GetColumnIndex()) {
            return lhs->GetColumnIndex() < rhs->GetColumnIndex();
        }
        if (lhs->IsVar()) {
            return !rhs->IsVar();
        } else if (rhs->IsVar()) {
            return false;
        } else {
            return lhs->GetPatternValue() < rhs->GetPatternValue();
        }
    };

    explicit operator std::string() const {
        return ToString();
    }
};

class TuplePattern {
private:
    ColumnLayoutPartialRelationData const* rel_;
    bool is_const_, is_var_;
    std::map<unsigned int, int> pattern_values_;
    boost::dynamic_bitset<> indices_;

public:
    explicit TuplePattern(ColumnLayoutPartialRelationData const* relation,
                          std::map<unsigned int, int> pattern_values,
                          boost::dynamic_bitset<> indices, bool is_const, bool is_var)
        : rel_(relation),
          is_const_(is_const),
          is_var_(is_var),
          pattern_values_(std::move(pattern_values)),
          indices_(std::move(indices)) {}

    explicit TuplePattern(ColumnLayoutPartialRelationData const* relation,
                          std::map<unsigned int, int> pattern_values,
                          boost::dynamic_bitset<> indices)
        : rel_(relation),
          is_const_(true),
          is_var_(true),
          pattern_values_(std::move(pattern_values)),
          indices_(std::move(indices)) {
        for (auto idx = this->indices_.find_first(); idx != boost::dynamic_bitset<>::npos;
             idx = this->indices_.find_next(idx)) {
            (pattern_values_[idx] == 0 ? is_const_ : is_var_) = false;
        }
    }

    explicit TuplePattern(ColumnLayoutPartialRelationData const* relation)
        : TuplePattern(relation, {},
                       boost::dynamic_bitset<>(relation->GetSchema()->GetNumColumns())) {}

    TuplePattern(TuplePattern const& other) = default;
    TuplePattern& operator=(const TuplePattern& rhs) = default;
    TuplePattern(TuplePattern&& other) = default;
    TuplePattern& operator=(TuplePattern&& rhs) = default;

    ~TuplePattern() = default;

    static TuplePattern UnionTuplePatterns(const TuplePattern& lhs, const TuplePattern& rhs) {
        std::vector<int> res;
        auto union_indices = lhs.GetColumnIndices() | rhs.GetColumnIndices();
        auto pattern_values = std::map<unsigned int, int>(lhs.GetPatternValues().begin(),
                                                          lhs.GetPatternValues().end());
        unsigned long a_index = (union_indices - lhs.GetColumnIndices()).find_first();
        pattern_values.insert({a_index, rhs.GetPatternValue(a_index)});

        return TuplePattern(lhs.GetRelation(), pattern_values, union_indices);
    }

    const boost::dynamic_bitset<>& GetColumnIndices() const {
        return indices_;
    }

    boost::dynamic_bitset<>& GetColumnIndices() {
        return indices_;
    }

    const ColumnLayoutPartialRelationData* GetRelation() const {
        return rel_;
    }

    std::string ToString(const std::vector<std::string>& item_names = {}) const {
        std::string res = "(";
        for (auto idx = GetColumnIndices().find_first(); idx != boost::dynamic_bitset<>::npos;
             idx = GetColumnIndices().find_next(idx)) {
            res += rel_->GetSchema()->GetColumn(idx)->GetName() + "=";
            res += item_names.empty() ? std::to_string(GetPatternValue(idx))
                                      : item_names[GetPatternValue(idx)];
            res += ", ";
        }
        res = res.substr(0, res.find_last_of(',')) + ")";
        return res;
    }

    std::string ToStringOnlyIndices() const {
        std::string res;
        for (auto idx = GetColumnIndices().find_first(); idx != boost::dynamic_bitset<>::npos;
             idx = GetColumnIndices().find_next(idx)) {
            res.append(std::to_string(rel_->GetSchema()->GetColumn(idx)->GetIndex()));
            res.append("=" + std::to_string(pattern_values_.at(idx)));
            res.append(",");
        }
        res = res.substr(0, res.find_last_of(','));
        return res;
    }

    auto Size() const {
        return indices_.count();
    }

    const std::map<unsigned int, int>& GetPatternValues() const {
        return pattern_values_;
    }

    std::map<unsigned int, int>& GetPatternValues() {
        return pattern_values_;
    }

    int GetPatternValue(unsigned int col_id) const {
        return GetPatternValues().at(col_id);
    }

    bool operator==(TuplePattern const& rhs) const {
        if (Size() != rhs.Size() || GetColumnIndices() != rhs.GetColumnIndices()) {
            return false;
        } else {
            for (auto idx = indices_.find_first(); idx != boost::dynamic_bitset<>::npos;
                 idx = indices_.find_next(idx)) {
                if (GetPatternValue(idx) != rhs.GetPatternValue(idx)) {
                    return false;
                }
            }
            return true;
        }
    }

    bool HasColumnPattern(ColumnPattern const& rhs) const {
        auto rhs_idx = rhs.GetColumnIndex();
        if (!GetColumnIndices()[rhs_idx]) {
            return false;
        } else {
            return GetPatternValue(rhs_idx) == rhs.GetPatternValue();
        }
    }

    bool IsConst() const {
        return is_const_;
    }

    bool IsVar() const {
        return is_var_;
    }

    TuplePattern GetWithoutColumn(unsigned int column_index) const {
        std::map<unsigned int, int> pattern_values(GetPatternValues().begin(),
                                                   GetPatternValues().end());
        pattern_values.erase(column_index);
        auto indices = this->GetColumnIndices();
        indices.set(column_index, false);
        return TuplePattern(GetRelation(), pattern_values, indices);
    }

    bool operator<=(TuplePattern const& rhs) const {
        if (!GetColumnIndices().is_subset_of(rhs.GetColumnIndices())) {
            return false;
        }
        for (auto idx = GetColumnIndices().find_first(); idx != boost::dynamic_bitset<>::npos;
             idx = GetColumnIndices().find_next(idx)) {
            if (GetPatternValue(idx) != rhs.GetPatternValue(idx) && rhs.GetPatternValue(idx)) {
                return false;
            }
        }
        return true;
    }

    bool IsMoreGeneralThan(TuplePattern const& rhs) const {
        return rhs <= *this && !(*this <= rhs);
    }

    ColumnPattern* GetAsColumnPattern(size_t col_index) const {
        assert(GetColumnIndices()[col_index] != 0);
        return new ColumnPattern(rel_->GetSchema()->GetColumn(col_index),
                                 GetPatternValue(col_index));
    }

    explicit operator std::string() const {
        return ToString();
    }
};

} // namespace model
