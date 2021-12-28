#pragma once

#include <vector>

#include "Column.h"
#include "PatternPositionListIndex.h" // Column.h

class PatternColumnData {
private:
    Column const* column_;
    std::shared_ptr<util::PatternPositionListIndex> pattern_position_list_index_;

public:
    PatternColumnData(Column const* column, std::unique_ptr<util::PatternPositionListIndex> pattern_position_list_index);

    std::vector<int> const& GetProbingTable() const {
        return *pattern_position_list_index_->GetCachedProbingTable();
    }
    Column const* GetColumn() const { return column_; }

    int GetProbingTableValue(int tuple_index) const {
        return (*pattern_position_list_index_->GetCachedProbingTable())[tuple_index];
    }
    util::PatternPositionListIndex const* GetPatternPositionListIndex() const {
        return pattern_position_list_index_.get();
    }

    std::shared_ptr<util::PatternPositionListIndex> GetPPLIOwnership() { return pattern_position_list_index_; }

    std::string ToString() const { return "Data for " + column_->ToString(); }

    bool operator==(const PatternColumnData& rhs);
};
