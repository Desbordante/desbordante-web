#include "fd_algorithm.h"
#include "json.hpp"

#include <thread>

#include "column_layout_relation_data.h"

unsigned long long FDAlgorithm::Execute() {
    Initialize();

    return ExecuteInternal();
}

std::vector<std::string> FDAlgorithm::GetColumnNames() {
    return input_generator_->GetColumnNames();
}

std::vector<size_t> FDAlgorithm::GetPKColumnPositions(CSVParser inputGenerator) {
    std::vector<size_t> positions;
    auto relation_ = ColumnLayoutRelationData::CreateFrom(inputGenerator, true);
    for (auto const& col : relation_->GetColumnData()) { 
        if (col.GetPositionListIndex()->GetNumNonSingletonCluster() == 0) {
            positions.push_back(col.GetColumn()->GetIndex());
        }
    }
    return positions;
}

std::string FDAlgorithm::GetJsonFDs(bool withNullLhs) {
    nlohmann::json j = nlohmann::json::array();

    fd_collection_.sort();
    for (auto& fd : fd_collection_) {
        if (withNullLhs) {
            j.push_back(fd.ToJSON());
        } else {
            if (fd.GetLhs().GetArity() != 0)
                j.push_back(fd.ToJSON());
        }
    }
    return j.dump();
}

std::string FDAlgorithm::GetJsonArrayNameValue(int degree, bool withAttr) {
    size_t numberOfColumns = input_generator_->GetNumberOfColumns();
    auto columnNames = input_generator_->GetColumnNames();

    std::vector<std::pair<double, int>> LhsValues(numberOfColumns);
    std::vector<std::pair<double, int>> RhsValues(numberOfColumns);
    
    for (size_t i = 0; i != numberOfColumns; ++i) {
        LhsValues[i] = RhsValues[i] = { 0, i };
    }

    for (const auto &fd : fd_collection_) {
        double divisor = std::pow(fd.GetLhs().GetArity(), degree);

        const auto &LhsColumnIndices = fd.GetLhs().GetColumnIndices();
        for (size_t index = LhsColumnIndices.find_first();
            index != boost::dynamic_bitset<>::npos;
            index = LhsColumnIndices.find_next(index)) {
                LhsValues[index].first += 1/divisor;
        }
        size_t index = fd.GetRhs().GetIndex();

        if (divisor != 0)
            RhsValues[index].first += 1/divisor;
        else
            RhsValues[index].first = -1;
    }

    auto pair_greater = [](std::pair<double, int> a, std::pair<double, int> b) {
        return a.first > b.first;
    };

    std::sort(LhsValues.begin(), LhsValues.end(), pair_greater);
    std::sort(RhsValues.begin(), RhsValues.end(), pair_greater);

    nlohmann::json j;

    std::vector<std::pair<nlohmann::json, nlohmann::json>> lhs_array;
    std::vector<std::pair<nlohmann::json, nlohmann::json>> rhs_array;

    for (size_t i = 0; i != numberOfColumns; ++i) {
        auto name = withAttr ? columnNames[LhsValues[i].second] : std::string("Attribute " + i);
        if (LhsValues[i].first > 0) {
            lhs_array.push_back({{"name", name}, {"value", LhsValues[i].first}});
        }
        name = withAttr ? columnNames[RhsValues[i].second] : std::string("Attribute " + i);
        if (RhsValues[i].first > 0) {
            rhs_array.push_back({{"name", name}, {"value", RhsValues[i].first}});
        }
    }
    
    j["lhs"] = lhs_array;
    j["rhs"] = rhs_array;

    return j.dump();
}

std::string FDAlgorithm::GetJsonArrayNameValue(std::vector<std::string> const &colNames, int degree) {
    size_t numberOfColumns = input_generator_->GetNumberOfColumns();

    std::vector<std::pair<double, int>> LhsValues(numberOfColumns);
    std::vector<std::pair<double, int>> RhsValues(numberOfColumns);
    
    for (size_t i = 0; i != numberOfColumns; ++i) {
        LhsValues[i] = RhsValues[i] = { 0, i };
    }

    for (const auto &fd : fd_collection_) {
        double divisor = std::pow(fd.GetLhs().GetArity(), degree);

        const auto &LhsColumnIndices = fd.GetLhs().GetColumnIndices();
        for (size_t index = LhsColumnIndices.find_first();
            index != boost::dynamic_bitset<>::npos;
            index = LhsColumnIndices.find_next(index)) {
                LhsValues[index].first += 1/divisor;
        }
        size_t index = fd.GetRhs().GetIndex();

        if (divisor != 0)
            RhsValues[index].first += 1/divisor;
        else
            RhsValues[index].first = -1;
    }

    auto pair_greater = [](std::pair<double, int> a, std::pair<double, int> b) {
        return a.first > b.first;
    };

    nlohmann::json j;
    std::vector<std::pair<nlohmann::json, nlohmann::json>> lhs_array;
    std::vector<std::pair<nlohmann::json, nlohmann::json>> rhs_array;

    for (size_t i = 0; i != numberOfColumns; ++i) {
        lhs_array.push_back({ { "name", colNames[LhsValues[i].second] }, { "value", LhsValues[i].first } });
        rhs_array.push_back({ { "name", colNames[LhsValues[i].second] }, { "value", RhsValues[i].first } });
    }
    
    j["lhs"] = lhs_array;
    j["rhs"] = rhs_array;

    return j.dump();
}

std::string FDAlgorithm::GetPieChartData(int degree) {
    size_t numberOfColumns = input_generator_->GetNumberOfColumns();

    std::vector<double> LhsValues(numberOfColumns, 0);
    std::vector<double> RhsValues(numberOfColumns, 0);

    for (const auto &fd : fd_collection_) {
        double divisor = std::pow(fd.GetLhs().GetArity(), degree);

        const auto &LhsColumnIndices = fd.GetLhs().GetColumnIndices();
        for (size_t index = LhsColumnIndices.find_first();
            index != boost::dynamic_bitset<>::npos;
            index = LhsColumnIndices.find_next(index)) {
                LhsValues[index] += 1 / divisor;
        }
        size_t index = fd.GetRhs().GetIndex();

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

void FDAlgorithm::InitConfigParallelism() {
    if (config_.parallelism == 0) {
        config_.parallelism = std::thread::hardware_concurrency();
        if (config_.parallelism == 0) {
            throw std::runtime_error(
                    "Unable to detect number of concurrent "
                    "threads supported by your system. "
                    "Please, specify it manually.");
        }
    }
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

/* Attribute A contains only unique values (i.e. A is the key) iff [A]->[B]
 * holds for every attribute B. So to determine if A is a key, we count
 * number of fds with lhs==[A] and if it equals the total number of attributes
 * minus one (the attribute A itself) then A is the key.
 */
std::vector<Column const*> FDAlgorithm::GetKeys() const {
    std::vector<Column const*> keys;
    std::map<Column const*, size_t> fds_count_per_col;
    unsigned int cols_of_equal_values = 0;
    size_t const number_of_cols = input_generator_->GetNumberOfColumns();

    for (FD const& fd : fd_collection_) {
        Vertical const& lhs = fd.GetLhs();

        if (lhs.GetArity() == 0) {
            /* We separately count columns consisting of only equal values,
             * because they cannot be on the right side of the minimal fd.
             * And obviously for every attribute A true: [A]->[B] holds
             * if []->[B] holds.
             */
            cols_of_equal_values++;
        } else if (lhs.GetArity() == 1) {
            fds_count_per_col[lhs.GetColumns().front()]++;
        }
    }

    for (auto const& [col, num] : fds_count_per_col) {
        if (num + 1 + cols_of_equal_values == number_of_cols) {
            keys.push_back(col);
        }
    }

    return keys;
}

std::vector<model::TypedColumnData> FDAlgorithm::CreateColumnData(
        const FDAlgorithm::Config& config) {
    CSVParser input_generator(config.data, config.separator, config.has_header);
    std::unique_ptr<model::ColumnLayoutTypedRelationData> relation_data =
            model::ColumnLayoutTypedRelationData::CreateFrom(input_generator,
                                                             config.is_null_equal_null, -1, -1);
    std::vector<model::TypedColumnData> col_data = std::move(relation_data->GetColumnData());
    return col_data;
}

std::string FDAlgorithm::GetJsonColumnNames() {
    nlohmann::json j = nlohmann::json(input_generator_->GetColumnNames());
    return j.dump();
}
