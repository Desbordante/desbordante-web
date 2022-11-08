#pragma once

#include <cmath>
#include <vector>
#include <easylogging++.h>


#include "partial_column_data.h"
#include "csv_parser.h"
#include "relational_schema.h"
#include "relation_data.h"

namespace model {

using PartialRelationData = AbstractRelationData<std::map<int, PartialColumnData>>;

class ColumnLayoutPartialRelationData final : public PartialRelationData {
public:
    using PartialRelationData::AbstractRelationData;
    using ItemNames = std::vector<std::string>;
    static constexpr int unnamed_value_id_ = 0;

    static std::pair<ItemNames, std::unique_ptr<ColumnLayoutPartialRelationData>>
    CreateFrom(model::IDatasetStream& file_input, bool is_null_eq_null, unsigned int support = 1,
               int max_cols = -1, long max_rows = -1);

    size_t GetNumRows() const override {
        return column_data_[0].begin()->second.GetProbingTable().size();
    }

};

}
