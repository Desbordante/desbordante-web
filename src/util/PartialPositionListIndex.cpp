#include <algorithm>
#include <deque>
#include <map>
#include <memory>
#include <utility>

#include <easylogging++.h>
#include <boost/dynamic_bitset.hpp>

#include "ColumnLayoutRelationData.h"
#include "ColumnLayoutPartialRelationData.h"
#include "PartialPositionListIndex.h"
#include "Vertical.h"

namespace util {

const int PartialPositionListIndex::singleton_value_id_ = 0;
int PartialPositionListIndex::intersection_count_ = 0;

PartialPositionListIndex::PartialPositionListIndex(std::deque<std::vector<int>> index,
                                                   unsigned int size, unsigned int relation_size,
                                                   unsigned int original_relation_size)
    : index_(std::move(index)),
      size_(size),
      relation_size_(relation_size),
      original_relation_size_(original_relation_size),
      probing_table_cache_() {}

std::map<int, std::unique_ptr<util::PartialPositionListIndex>> PartialPositionListIndex::CreateFor(
    std::vector<int>& data, bool is_null_eq_null, unsigned int support) {
    std::unordered_map<int, std::vector<int>> index;
    for (unsigned long position = 0; position < data.size(); ++position) {
        int value_id = data[position];
        index[value_id].push_back(position);
    }

    if (!is_null_eq_null) {
        index.erase(ColumnLayoutRelationData::kNullValueId);
    }

    unsigned int size = 0;
    std::deque<std::vector<int>> unnamed_clusters;

    for (auto& [row_num, positions] : index) {
        size += positions.size();
        unnamed_clusters.emplace_back(positions);
    }

    SortClusters(unnamed_clusters);
    std::map<int, std::unique_ptr<util::PartialPositionListIndex>> plis;
    if (size >= support) {
        plis.emplace(model::ColumnLayoutPartialRelationData::unnamed_value_id_,
                     std::make_unique<PartialPositionListIndex>(std::move(unnamed_clusters), size,
                                                                data.size(), data.size()));

        for (auto& [row_num, positions] : index) {
            size = positions.size();
            if (size < support) {
                continue;
            }
            auto value_id = data[positions[0]];
            plis.emplace(value_id, std::make_unique<PartialPositionListIndex>(
                                       std::deque<std::vector<int>>({std::move(positions)}), size,
                                       data.size(), data.size()));
        }
    }
    return plis;
}

void PartialPositionListIndex::SortClusters(std::deque<std::vector<int>>& clusters) {
    sort(clusters.begin(), clusters.end(),
         [](std::vector<int>& a, std::vector<int>& b) { return a[0] < b[0]; });
}

std::shared_ptr<const std::vector<int>> PartialPositionListIndex::CalculateAndGetProbingTable()
    const {
    if (probing_table_cache_ != nullptr) {
        return probing_table_cache_;
    }

    std::vector<int> probing_table = std::vector<int>(original_relation_size_);
    int next_cluster_id = singleton_value_id_ + 1;
    for (auto& cluster : index_) {
        int value_id = next_cluster_id++;
        for (int position : cluster) {
            probing_table[position] = value_id;
        }
    }
    return std::make_shared<std::vector<int>>(probing_table);
}

std::unique_ptr<PartialPositionListIndex> PartialPositionListIndex::Intersect(
    PartialPositionListIndex const* that) const {
    assert(this->relation_size_ == that->relation_size_);
    return this->size_ > that->size_ ? that->Probe(this->CalculateAndGetProbingTable())
                                     : this->Probe(that->CalculateAndGetProbingTable());
}

std::unique_ptr<PartialPositionListIndex> PartialPositionListIndex::Probe(
    std::shared_ptr<const std::vector<int>> probing_table) const {
    assert(this->relation_size_ == probing_table->size());
    std::deque<std::vector<int>> new_index;
    unsigned int new_size = 0;

    std::unordered_map<int, std::vector<int>> partial_index;

    for (auto& positions : index_) {
        for (int position : positions) {
            if (position < 0 || position >= (int)probing_table->size()) {
                LOG(DEBUG) << "position: " + std::to_string(position) +
                                  ", size: " + std::to_string(probing_table->size());
                for (auto pos : positions) {
                    LOG(DEBUG) << "Position " << pos;
                }
            }
            int probing_table_value_id = (*probing_table)[position];
            if (probing_table_value_id == singleton_value_id_) {
                continue;
            }
            intersection_count_++;
            partial_index[probing_table_value_id].push_back(position);
        }

        for (auto& iter : partial_index) {
            auto& cluster = iter.second;
            if (cluster.empty()) continue;

            new_size += cluster.size();
            new_index.push_back(std::move(cluster));
        }
        partial_index.clear();
    }

    SortClusters(new_index);

    return std::make_unique<PartialPositionListIndex>(std::move(new_index), new_size,
                                                      relation_size_, relation_size_);
}

std::unique_ptr<PartialPositionListIndex> PartialPositionListIndex::CreatePliForEmptyVertex(
    unsigned int relation_size) {
    std::deque<std::vector<int>> index{{}};
    for (int i = 0; i != (int)relation_size; ++i) {
        index[0].emplace_back(i);
    }
    return std::make_unique<PartialPositionListIndex>(std::move(index), relation_size, relation_size, relation_size);
}

std::string PartialPositionListIndex::ToString() const {
    std::string res = "[";
    for (auto& cluster : index_) {
        res.push_back('[');
        for (int v : cluster) {
            res.append(std::to_string(v) + ",");
        }
        if (res.find(',') != std::string::npos) res.erase(res.find_last_of(','));
        res.push_back(']');
        res.push_back(',');
    }
    if (res.find(',') != std::string::npos) res.erase(res.find_last_of(','));
    res.push_back(']');
    return res;
}

} // namespace util
