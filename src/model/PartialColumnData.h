#pragma once

#include <vector>

#include "Column.h"
#include "AbstractColumnData.h"
#include "PartialPositionListIndex.h"

namespace model {

class PartialColumnData final : public AbstractColumnData {
private:
    std::shared_ptr<util::PartialPositionListIndex> pattern_position_list_index_;

public:
    PartialColumnData(Column const* column,
                      std::unique_ptr<util::PartialPositionListIndex> pattern_position_list_index);

    std::vector<int> const& GetProbingTable() const {
        return *pattern_position_list_index_->GetCachedProbingTable();
    }

    int GetProbingTableValue(int tuple_index) const {
        return (*pattern_position_list_index_->GetCachedProbingTable())[tuple_index];
    }

    util::PartialPositionListIndex const* GetPli() const {
        return pattern_position_list_index_.get();
    }

    std::string ToString() const final {
        return "Column data for " + column_->ToString();
    }
};

} // namespace model
