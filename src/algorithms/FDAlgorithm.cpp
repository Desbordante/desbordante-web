#include "FDAlgorithm.h"
#include "json.hpp"
#include <iostream>
#include "ColumnLayoutRelationData.h"

std::vector<std::string> FDAlgorithm::getColumnNames() {
    return inputGenerator_.getColumnNames();
}

std::vector<size_t> FDAlgorithm::getPKColumnPositions(CSVParser inputGenerator) {
    std::vector<size_t> positions;
    auto relation_ = ColumnLayoutRelationData::createFrom(inputGenerator, true);
    for (auto const& col : relation_->getColumnData()) { 
        if (col.getPositionListIndex()->getNumNonSingletonCluster() == 0) {
            positions.push_back(col.getColumn()->getIndex());
        }
    }
    return positions;
}

std::string FDAlgorithm::getJsonFDs(bool withNullLhs) {
    nlohmann::json j = nlohmann::json::array();
    std::cout << "FDs " << fdCollection_.size() << std::endl;
    fdCollection_.sort();
    for (auto& fd : fdCollection_) {
        if (withNullLhs) {
            j.push_back(fd.toJSON());
        } else {
            if (fd.getLhs().getArity() != 0) {
                j.push_back(fd.toJSON());
            }
        }
    }
    return j.dump();
}

std::string FDAlgorithm::getPieChartData(int degree) {
    size_t numberOfColumns = inputGenerator_.getNumberOfColumns();

    std::vector<double> LhsValues(numberOfColumns, 0);
    std::vector<double> RhsValues(numberOfColumns, 0);

    for (const auto &fd : fdCollection_) {
        double divisor = std::pow(fd.getLhs().getArity(), degree);

        const auto &LhsColumnIndices = fd.getLhs().getColumnIndices();
        for (size_t index = LhsColumnIndices.find_first();
            index != boost::dynamic_bitset<>::npos;
            index = LhsColumnIndices.find_next(index)) {
                LhsValues[index] += 1 / divisor;
        }
        size_t index = fd.getRhs().getIndex();

        RhsValues[index] = (divisor == 0)
                ? -1
                : RhsValues[index] + 1 / divisor;

    }

    nlohmann::json j;
    std::vector<std::pair<nlohmann::json, nlohmann::json>> lhs_array;
    std::vector<std::pair<nlohmann::json, nlohmann::json>> rhs_array;

    for (size_t i = 0; i != numberOfColumns; ++i) {
        lhs_array.push_back({ { "idx", i }, { "value", LhsValues[i] } });
        rhs_array.push_back({ { "idx", i }, { "value", RhsValues[i] } });
    }
    
    j["lhs"] = lhs_array;
    j["rhs"] = rhs_array;

    return j.dump();
}

std::string FDAlgorithm::GetJsonFDs() const {
        return FDsToJson(fd_collection_);
}

unsigned int FDAlgorithm::Fletcher16() {
    std::string to_hash = GetJsonFDs();
    unsigned int sum1 = 0, sum2 = 0, modulus = 255;
    for (auto ch : to_hash) {
        sum1 = (sum1 + ch) % modulus;
        sum2 = (sum2 + sum1) % modulus;
    }
    return (sum2 << 8) | sum1;
}

std::string FDAlgorithm::getJsonColumnNames() {
    nlohmann::json j = nlohmann::json(inputGenerator_.getColumnNames());
    return j.dump();
}