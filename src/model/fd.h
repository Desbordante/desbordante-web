#pragma once

#include <string>

#include "column.h"
#include "vertical.h"

#include "json.hpp"

class FD {
private:
    Vertical lhs_;
    Column rhs_;

public:
    FD(Vertical const& lhs, Column const& rhs) : lhs_(lhs), rhs_(rhs) {}

    std::string ToJSONString() const {
        return "{\"lhs\": " + lhs_.ToIndicesString() + ", \"rhs\": " + rhs_.ToIndicesString() + "}";
    }

    nlohmann::json ToJSON() const {
        nlohmann::json json;
        json["lhs"] = nlohmann::json::parse(lhs_.ToIndicesString());
        json["rhs"] = nlohmann::json::parse(rhs_.ToIndicesString());
        return json;
    }

    bool operator<(FD const& rhs) const {
        return ToJSONString() < rhs.ToJSONString();
    }

    Vertical const& GetLhs() const { return lhs_; }
    Column const& GetRhs() const { return rhs_; }

    // unsigned int Fletcher16() const;
};