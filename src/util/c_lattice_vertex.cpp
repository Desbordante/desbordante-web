#include "c_lattice_vertex.h"

namespace util {

using boost::dynamic_bitset;

bool CLatticeVertex::ComesBeforeAndSharePrefixWith(CLatticeVertex const& rhs) const {
    const auto &indices = GetColumnIndices();
    const auto & rhs_indices = rhs.GetColumnIndices();

    auto index = indices.find_first();
    auto rhs_index = rhs_indices.find_first();

    auto arity = indices.count();
    for (unsigned long i = 0; i < arity - 1; i++){
        if (index != rhs_index || GetPatternValues().at(index) != rhs.GetPatternValues().at(rhs_index)) {
            return false;
        }
        index = indices.find_next(index);
        rhs_index = rhs_indices.find_next(rhs_index);
    }
    return index < rhs_index;
}

bool CLatticeVertex::operator>(CLatticeVertex const& rhs) const {
    if (GetColumnIndices().count() != rhs.GetColumnIndices().count()) {
        return GetColumnIndices().count() > rhs.GetColumnIndices().count();
    }

    const auto& indices = GetColumnIndices();
    const auto& rhs_indices = rhs.GetColumnIndices();

    for (auto [idx, rhs_idx] = std::pair(indices.find_first(), rhs_indices.find_first());
         idx != dynamic_bitset<>::npos || rhs_idx != dynamic_bitset<>::npos;
         std::tie(idx, rhs_idx) = std::pair(indices.find_next(idx), rhs_indices.find_next(rhs_idx))) {
        auto result = (long)idx - (long)rhs_idx;
        if (result) {
            return (result > 0);
        }
    }

    return rhs.GetTuplePattern().IsMoreGeneralThan(GetTuplePattern());
}

std::string CLatticeVertex::ToString() const {
    std::stringstream buffer;
    buffer << (*this);
    return buffer.str();
}

std::ostream& operator<<(std::ostream& os, const CLatticeVertex& vertex) {
    os << "Pattern" << vertex.GetTuplePattern().ToString() << std::endl;
    os << "Rhs Candidates: " << vertex.ToStringRhsCandidates() << std::endl;
    return os;
}

PartialPositionListIndex const *CLatticeVertex::GetPositionListIndex() const {
    if (std::holds_alternative<std::unique_ptr<PartialPositionListIndex>>(position_list_index_)) {
        return std::get<std::unique_ptr<PartialPositionListIndex>>(position_list_index_).get();
    } else {
        return std::get<PartialPositionListIndex const *>(position_list_index_);
    }
}

} // namespace util