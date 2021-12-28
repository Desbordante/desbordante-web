#pragma once

#include <cmath>
#include <vector>

#include "pattern_column_data.h"
#include "csv_parser.h"
#include "relational_schema.h"
#include "relation_data.h"

class PatternColumnLayoutRelationData {
private:

    std::vector<std::map<int, PatternColumnData>> pattern_column_data_;

    std::unique_ptr<RelationalSchema> schema_;
public:
    static constexpr int null_value_id_ = -1;

    RelationalSchema const* GetSchema() const { return schema_.get(); }

    std::vector<std::map<int, PatternColumnData>>& GetPatternColumnData() { return pattern_column_data_; };
    std::vector<std::map<int, PatternColumnData>> const& GetPatternColumnData() const { return pattern_column_data_; };

    std::map<int, PatternColumnData> const& GetColumnPatterns(size_t column_index) const {
        return pattern_column_data_[column_index];
    }

    unsigned int GetNumRows() const { return pattern_column_data_[0].begin()->second.GetProbingTable().size(); }

    PatternColumnLayoutRelationData(std::unique_ptr<RelationalSchema> schema,
                             std::vector<std::map<int, PatternColumnData>> pattern_column_data);

    static std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>>
    CreateFrom(
            CSVParser& file_input, bool is_null_eq_null, unsigned  int support = 1);
    static std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>>
    CreateFrom(
            CSVParser& file_input, bool is_null_eq_null, int max_cols, long max_rows, unsigned  int support);
};
