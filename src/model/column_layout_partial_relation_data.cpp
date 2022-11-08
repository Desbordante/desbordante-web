
#include <map>
#include <memory>
#include <utility>

#include "column_layout_partial_relation_data.h"
#include "easylogging++.h"

namespace model {

std::pair<ColumnLayoutPartialRelationData::ItemNames,
          std::unique_ptr<ColumnLayoutPartialRelationData>>
ColumnLayoutPartialRelationData::CreateFrom(model::IDatasetStream& file_input, bool is_null_eq_null,
                                            unsigned int support, int max_cols, long max_rows) {
    auto schema = std::make_unique<RelationalSchema>(file_input.GetRelationName(), is_null_eq_null);
    std::unordered_map<std::string, int> item_names;
    int next_value_id = 1;
    const int kNullValueId = -1;
    int num_columns = file_input.GetNumberOfColumns();
    if (max_cols > 0) num_columns = std::min(num_columns, max_cols);
    std::vector<std::vector<int>> column_vectors = std::vector<std::vector<int>>(num_columns);
    int row_num = 0;
    std::vector<std::string> row;
    ItemNames item_universe { "_" };

    while (file_input.HasNextRow()) {
        row = file_input.GetNextRow();

        if (row.empty() && num_columns == 1) {
            row.emplace_back("");
        } else if ((int)row.size() != num_columns) {
            LOG(WARNING) << "Skipping incomplete rows";
            continue;
        }

        if (max_rows <= 0 || row_num < max_rows) {
            int index = 0;
            for (std::string& field : row) {
                if (field.empty()) {
                    column_vectors[index].push_back(kNullValueId);
                } else {
                    auto location = item_names.find(field);
                    int value_id;
                    if (location == item_names.end()) {
                        item_names[field] = next_value_id;
                        item_universe.emplace_back(field);
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

    std::vector<ColumnType> column_data;
    for (int i = 0; i < num_columns; ++i) {
        auto column = Column(schema.get(), file_input.GetColumnName(i), i);
        schema->AppendColumn(std::move(column));
        auto PLIs = util::PartialPositionListIndex::CreateFor(
            column_vectors[i], schema->IsNullEqualNull(), support);
        ColumnType column_patterns;
        for (auto& [key, pattern_position_list_index] : PLIs) {
            column_patterns.emplace(key, PartialColumnData(schema->GetColumn(i),
                                                           std::move(pattern_position_list_index)));
        }
        column_data.emplace_back(std::move(column_patterns));
    }
    schema->Init();

    return {std::move(item_universe), std::make_unique<ColumnLayoutPartialRelationData>(
                                          std::move(schema), std::move(column_data))};
}

} // namespace model
