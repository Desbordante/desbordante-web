#pragma once

#include <string>

#include "Column.h"
#include "Vertical.h"

class FD {
private:
    Vertical lhs_;
    Column rhs_;

public:
    FD(Vertical const& lhs, Column const& rhs) : lhs_(lhs), rhs_(rhs) {}

    std::string ToJSONString() const {
        return "{lhs: " + lhs_.ToIndicesString() + ", rhs: " + rhs_.ToIndicesString() + "}";
    }

    std::string ToCompactString() const {
        auto result = lhs_.ToIndicesString(false);
        if (!result.empty()) {
            result += ',';
        }
        result += rhs_.ToIndicesString();
        return result;
    }

    Vertical const& GetLhs() const { return lhs_; }
    Column const& GetRhs() const { return rhs_; }

    // unsigned int Fletcher16() const;
};