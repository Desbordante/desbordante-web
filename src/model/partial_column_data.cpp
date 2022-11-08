#include "partial_column_data.h"

#include <utility>

namespace model {

PartialColumnData::PartialColumnData(
    Column const* column,
    std::unique_ptr<util::PartialPositionListIndex> pattern_position_list_index)
    : AbstractColumnData(column), pattern_position_list_index_(std::move(pattern_position_list_index)) {
    pattern_position_list_index_->ForceCacheProbingTable();
}

} // namespace model
