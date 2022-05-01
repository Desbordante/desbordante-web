#pragma once

#include <algorithm>

#include <boost/dynamic_bitset.hpp>
#include <utility>

#include "fd.h"
#include "tuple_pattern.h"

namespace model {

class CFD {
private:
    TuplePattern lhs_pattern_;
    ColumnPattern rhs_pattern_;
    double conf_;
    unsigned int sup_;

public:
    CFD(TuplePattern lhs_pattern, ColumnPattern const& rhs_pattern, double conf = 1,
        unsigned int sup = 1)
        : lhs_pattern_(std::move(lhs_pattern)), rhs_pattern_(rhs_pattern), conf_(conf), sup_(sup) {}

    std::string ToString(const std::vector<std::string>& item_names = {}) const {
        return lhs_pattern_.ToString(item_names) + " -> " + rhs_pattern_.ToString(item_names);
    }

    [[nodiscard]] std::string ToCompactString() const {
        std::string result;
        std::stringstream stream;
        stream << std::fixed << std::setprecision(2) << conf_
               << ":" << lhs_pattern_.ToStringOnlyIndices()
               << ":" << rhs_pattern_.ToStringOnlyIndices()
               << ":" << sup_;
        result.append(stream.str());
        return result;
    }

    TuplePattern const& GetLhsPattern() const {
        return lhs_pattern_;
    }
    ColumnPattern const& GetRhsPattern() const {
        return rhs_pattern_;
    }
};

} // namespace model