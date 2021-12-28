#pragma once
#include <algorithm>

#include <boost/dynamic_bitset.hpp>
#include <utility>

#include "PatternColumnLayoutRelationData.h"

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

    std::string ToString(const std::unordered_map<int, std::string>& item_names = {}) const {
        std::string res;
        res += "" + GetColumnName();// + ",";
        res += IsVar()
               ? ""
               : item_names.empty()
                 ? "=" + std::to_string(GetPatternValue())
                 : "=" + item_names.at(GetPatternValue());
        res += "";
        return res;
    }

    bool operator==(const ColumnPattern& rhs) const {
        return GetColumnIndex() == rhs.GetColumnIndex() &&
               GetPatternValue() == rhs.GetPatternValue();
    }

    bool operator<=(const ColumnPattern& rhs) const {
        std::cout << this->ToString() << " rhs " << rhs.ToString() << " " << (GetColumnIndex() == rhs.GetColumnIndex() &&
                                                                              (GetPatternValue() == rhs.GetPatternValue() || !rhs.GetPatternValue())) << std::endl;
        return GetColumnIndex() == rhs.GetColumnIndex() &&
            (GetPatternValue() == rhs.GetPatternValue() || !rhs.GetPatternValue());
    }

    static bool LexicographicComparator(const ColumnPattern &lhs, const ColumnPattern &rhs)  {
        if (lhs.GetColumnIndex() != rhs.GetColumnIndex()) {
            return lhs.GetColumnIndex() < rhs.GetColumnIndex();
        } else {
            return lhs.GetPatternValue() < rhs.GetPatternValue();
        }
    }

    bool IsMoreGeneralThan(const ColumnPattern& rhs) const {
        if (*col_ != *rhs.GetColumn()) {
            return false;
        }
        return IsVar() && rhs.IsConst();
    }

    explicit operator std::string() const { return ToString(); }
};

class TuplePattern {
private:
    PatternColumnLayoutRelationData const* rel_;

    std::vector<int> pattern_values_;

    boost::dynamic_bitset<> unnamed_indices_;
    boost::dynamic_bitset<> const_indices_;
    boost::dynamic_bitset<> indices;

public:

    explicit TuplePattern(PatternColumnLayoutRelationData const* relation,
                          std::vector<int> const_values,
                          boost::dynamic_bitset<> indices)
            : rel_(relation),
          pattern_values_(std::move(const_values)),
          unnamed_indices_(indices.size()),
          const_indices_(indices.size()),
            indices(std::move(indices))  {
        for (auto idx = this->indices.find_first(); idx != boost::dynamic_bitset<>::npos; idx = this->indices.find_next(idx)) {
            (pattern_values_[idx] != 0 ? const_indices_ : unnamed_indices_).set(idx, true);
        }
        assert(IsValid());
    }

    explicit TuplePattern(PatternColumnLayoutRelationData const* relation)
        : TuplePattern(relation, std::vector<int>(relation->GetSchema()->GetNumColumns()), boost::dynamic_bitset<>(relation->GetSchema()->GetNumColumns()))
    {}

    TuplePattern(TuplePattern const& other) = default;
    TuplePattern& operator=(const TuplePattern& rhs) = default;
    TuplePattern(TuplePattern&& other) = default;
    TuplePattern& operator=(TuplePattern&& rhs) = default;

    ~TuplePattern() = default;

    bool IsValid() const {
        auto union_indices = unnamed_indices_ | const_indices_;
        return !unnamed_indices_.intersects(const_indices_) && (union_indices == indices)
               &&
               unnamed_indices_.size() == const_indices_.size();
    }

    const auto& GetUnnamedIndices() const {
        return unnamed_indices_;
    }

    auto& GetUnnamedIndices() {
        return unnamed_indices_;
    }

    const auto& GetConstIndices() const {
        return const_indices_;
    }

    auto& GetConstIndices() {
        return const_indices_;
    }

    const auto& GetColumnIndices() const {
        return indices;
    }

    auto& GetColumnIndices() {
        return indices;
    }

    std::string ToString(const std::unordered_map<int, std::string>& item_names = {}) const {
        std::string res = "(";
        for (auto idx = GetColumnIndices().find_first(); idx != boost::dynamic_bitset<>::npos; idx = GetColumnIndices().find_next(idx)) {
            res += "" + rel_->GetSchema()->GetColumn(idx)->GetName();
            res += pattern_values_[idx] == 0
                    ? ""
                    : (item_names.empty() ? "=" + std::to_string(pattern_values_[idx]) : "=" + item_names.at(pattern_values_[idx]));
            res += ", ";
        }
        res = res.substr(0, res.find_last_of(',')) + ")";
        return res;
    }

    auto Size() const {
        return pattern_values_.size();
    }

    const auto& GetPatternValues() const {
        return pattern_values_;
    }

    auto& GetPatternValues() {
        return pattern_values_;
    }

    bool operator==(TuplePattern const& rhs) const {
        if (Size() != rhs.Size() || GetColumnIndices() != rhs.GetColumnIndices()) {
            return false;
        } else {
            for (auto idx = indices.find_first();
                 idx != boost::dynamic_bitset<>::npos;
                 idx = indices.find_next(idx)) {
                if (pattern_values_[idx] != rhs.GetPatternValues()[idx]) {
                    return false;
                }
            }
            return true;
        }
    }

    bool HasColumnPattern(ColumnPattern const &rhs) const {
        auto rhs_idx = rhs.GetColumnIndex();
        if (!GetColumnIndices()[rhs_idx]) {
            return false;
        } else {
            return GetPatternValues()[rhs_idx] == rhs.GetPatternValue();
        }
    }

    bool IsConst() const {
        return unnamed_indices_.count() == 0;
    }

    bool IsVar() const {
        return const_indices_.count() == 0;
    }

    std::vector<ColumnPattern const *> GetColumnPatterns() const {
        std::vector<ColumnPattern const *> col_patterns;
        for (auto idx = GetColumnIndices().find_first();
             idx != boost::dynamic_bitset<>::npos;
             idx = GetColumnIndices().find_next(idx)) {
            col_patterns.push_back(GetAsColumnPattern(idx));
        }
        return col_patterns;
    }

    TuplePattern GetWithoutColumn(unsigned int column_index) const {
        TuplePattern res(*this);
        assert(this->GetColumnIndices()[column_index]);

        res.GetConstIndices().set(column_index, false);
        res.GetUnnamedIndices().set(column_index, false);
        res.GetColumnIndices().set(column_index, false);
        res.GetPatternValues()[column_index] = 0;

        return res;
    }

    bool operator<=(TuplePattern const& rhs) const {
        if (!GetColumnIndices().is_subset_of(rhs.GetColumnIndices())) {
            return false;
        }
        for (auto idx = GetColumnIndices().find_first();
             idx != boost::dynamic_bitset<>::npos;
             idx = GetColumnIndices().find_next(idx)) {
            if (GetPatternValues()[idx] != rhs.GetPatternValues()[idx]
                &&
                rhs.GetPatternValues()[idx]) {
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
                                 GetPatternValues()[col_index]);
    }

    explicit operator std::string() const { return ToString(); }


};

