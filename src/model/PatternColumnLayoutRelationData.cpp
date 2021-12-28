
#include <map>
#include <memory>
#include <utility>

#include "PatternColumnLayoutRelationData.h"
#include "easylogging++.h"


PatternColumnLayoutRelationData::PatternColumnLayoutRelationData(std::unique_ptr<RelationalSchema> schema,
                                                   std::vector<std::map<int, PatternColumnData>> pattern_column_data)
        : pattern_column_data_(std::move(pattern_column_data)), schema_(std::move(schema)) {}


std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>> PatternColumnLayoutRelationData::CreateFrom(CSVParser & file_input, bool is_null_eq_null, unsigned int support) {
    return CreateFrom(file_input, is_null_eq_null, -1, -1, support);
}

std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>> PatternColumnLayoutRelationData::CreateFrom(
        CSVParser & file_input, bool is_null_eq_null, int max_cols, long max_rows, unsigned int support) {
    auto schema = std::make_unique<RelationalSchema>(file_input.GetRelationName(), is_null_eq_null);
    std::unordered_map<std::string, int> item_names;
    int next_value_id = 1;
    const int kNullValueId = -1;
    int num_columns = file_input.GetNumberOfColumns();
    if (max_cols > 0) num_columns = std::min(num_columns, max_cols);
    std::vector<std::vector<int>> column_vectors = std::vector<std::vector<int>>(num_columns);
    int row_num = 0;
    std::vector<std::string> row;

    while (file_input.GetHasNext()){
        row = file_input.ParseNext();

        if (row.empty() && num_columns == 1) {
            row.emplace_back("");
        } else if ((int)row.size() != num_columns) {
            LOG(WARNING) << "Skipping incomplete rows";
            continue;
        }

        if (max_rows <= 0 || row_num < max_rows){
            int index = 0;
            for (std::string& field : row){
                if (field.empty()){
                    column_vectors[index].push_back(kNullValueId);
                } else {
                    auto location = item_names.find(field);
                    int value_id;
                    if (location == item_names.end()){
                        item_names[field] = next_value_id;
                        value_id = next_value_id;
                        next_value_id++;
                    } else {
                        value_id = location->second;
                    }
                    column_vectors[index].push_back(value_id);
                }
                index++;
                if (index >= num_columns) break;
            }
        } else {
            assert(0);
        }
        row_num++;
    }

    std::vector<std::map<int, PatternColumnData>> pattern_column_data;
    for (int i = 0; i < num_columns; ++i) {
        auto column = Column(schema.get(), file_input.GetColumnName(i), i);
        schema->AppendColumn(std::move(column));
        auto column_PLIs = util::PatternPositionListIndex::CreateFor(
            column_vectors[i], schema->IsNullEqualNull(), support);
        std::map<int, PatternColumnData> column_patterns;
        for (auto& [key, pattern_position_list_index] : column_PLIs) {
            column_patterns.emplace(key, PatternColumnData(schema->GetColumn(i), std::move(pattern_position_list_index)));
        }
        pattern_column_data.emplace_back(std::move(column_patterns));
    }

    std::unordered_map<int, std::string> reverse_value_dictionary;
    for (auto& [key, value] : item_names) {
        reverse_value_dictionary.emplace(value, key);
    }
    schema->Init();

    return {reverse_value_dictionary, std::make_unique<PatternColumnLayoutRelationData>(std::move(schema), std::move(pattern_column_data)) };
}
