#pragma once
#include <memory>
#include <deque>
#include <vector>

#include "Column.h"

class ColumnLayoutRelationData;

namespace util {

class PartialPositionListIndex {
private:
    std::deque<std::vector<int>> index_;
    unsigned int size_;
    unsigned int relation_size_;
    unsigned int original_relation_size_;
    std::shared_ptr<const std::vector<int>> probing_table_cache_;

    static void SortClusters(std::deque<std::vector<int>>& clusters);

public:
    static int intersection_count_;
    static const int singleton_value_id_;

    PartialPositionListIndex(std::deque<std::vector<int>> index, unsigned int size,
                             unsigned int relation_size, unsigned int original_relation_size);

    static std::map<int, std::unique_ptr<util::PartialPositionListIndex>> CreateFor(
        std::vector<int>& data, bool is_null_eq_null, unsigned int support);

    std::shared_ptr<const std::vector<int>> CalculateAndGetProbingTable() const;
    std::vector<int> const* GetCachedProbingTable() const {
        return probing_table_cache_.get();
    };

    void ForceCacheProbingTable() {
        probing_table_cache_ = CalculateAndGetProbingTable();
    };

    std::deque<std::vector<int>> const& GetIndex() const {
        return index_;
    }
    unsigned int GetSize() const {
        return size_;
    }
    unsigned int GetPartitionsNumber() const {
        return index_.size();
    }

    static std::unique_ptr<PartialPositionListIndex> CreatePliForEmptyVertex(unsigned int relation_size);

    std::unique_ptr<PartialPositionListIndex> Intersect(PartialPositionListIndex const* that) const;
    std::unique_ptr<PartialPositionListIndex> Probe(
        std::shared_ptr<const std::vector<int>> probing_table) const;
    std::string ToString() const;
};

} // namespace util
