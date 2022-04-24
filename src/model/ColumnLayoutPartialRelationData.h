#pragma once

#include <cmath>
#include <vector>
#include <easylogging++.h>


#include "PartialColumnData.h"
#include "CSVParser.h"
#include "RelationalSchema.h"
#include "RelationData.h"

namespace model {

using PartialRelationData = AbstractRelationData<std::map<int, PartialColumnData>>;

class ColumnLayoutPartialRelationData final : public PartialRelationData {
public:
    using PartialRelationData::AbstractRelationData;
    using ItemNames = std::vector<std::string>;
    static constexpr int unnamed_value_id_ = 0;

    static std::pair<ItemNames, std::unique_ptr<ColumnLayoutPartialRelationData>>
    CreateFrom(CSVParser& file_input, bool is_null_eq_null, unsigned int support = 1,
               int max_cols = -1, long max_rows = -1);

    unsigned int GetNumRows() const override {
        return column_data_[0].begin()->second.GetProbingTable().size();
    }

};

}
