#pragma once

#include <algorithm>

#include <boost/dynamic_bitset.hpp>
#include <utility>

#include "FD.h"
#include "TuplePattern.h"

namespace model {

class CFD {
private:
    TuplePattern lhs_pattern_;
    ColumnPattern rhs_pattern_;

public:
    CFD(TuplePattern lhs_pattern, ColumnPattern const& rhs_pattern)
        : lhs_pattern_(std::move(lhs_pattern)), rhs_pattern_(rhs_pattern) {}

    std::string ToString(const std::vector<std::string>& item_names = {}) const {
        return lhs_pattern_.ToString(item_names) + " -> " + rhs_pattern_.ToString(item_names);
    }

    TuplePattern const& GetLhsPattern() const {
        return lhs_pattern_;
    }
    ColumnPattern const& GetRhsPattern() const {
        return rhs_pattern_;
    }
};

} // namespace model