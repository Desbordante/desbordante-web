#pragma once

#include "algorithms/create_primitive.h"

namespace resolvers {

// Converts algo name from name in DB to name in Desbordante
static std::string ResolveAlgoName(std::string algo) {
    if (algo == "TaneX") {
        return "tane";
    }
    if (algo == "Typo Miner") {
        return "typo_miner";
    }
    if (algo == "MetricVerification") {
        return "metric";
    }
    algo.erase(remove_if(algo.begin(), algo.end(), isspace), algo.end());
    std::transform(algo.begin(), algo.end(), algo.begin(), ::tolower);
    return algo;
}

}  // namespace resolvers
