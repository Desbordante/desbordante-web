#include "pattern_column_data.h"

#include <utility>


PatternColumnData::PatternColumnData(Column const* column,
    std::unique_ptr<util::PatternPositionListIndex> pattern_position_list_index)
        : column_(column), pattern_position_list_index_(std::move(pattern_position_list_index)) {
    pattern_position_list_index_->ForceCacheProbingTable();
}

bool PatternColumnData::operator==(const PatternColumnData &rhs) {
    if (this == &rhs) return true;
    return this->column_ == rhs.column_;
}