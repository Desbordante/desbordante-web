#pragma once

#include <map>
#include <set>
#include <string>
#include <utility>
#include <boost/mp11.hpp>
#include <boost/mp11/algorithm.hpp>
#include <boost/mp11/list.hpp>

#include "algorithms/primitive.h"
#include "table_processor.h"

#include "id_algorithm.h"
#include "model/cursor.h"

namespace algos {

class Spider : public IDAlgorithm {
public:
    using UID = std::pair<std::size_t, std::size_t>;
    class Attribute;
    using AttrMap = std::unordered_map<std::size_t, Attribute>;

    class Attribute {
    public:
        using SSet = std::set<std::size_t>;

    private:
        std::size_t id_;
        StrCursor cursor_;
        SSet refs_, deps_;

    public:
        Attribute(std::size_t id, std::size_t n_cols, StrCursor cursor,
                  std::vector<std::string> const& max_values)
            : id_(id), cursor_(std::move(cursor)) {
            for (std::size_t i = 0; i != n_cols; ++i) {
                if (GetID() == i) {
                    continue;
                }
                if (max_values[GetID()] <= max_values[i]) {
                    GetRefs().insert(i);
                }
                if (max_values[GetID()] >= max_values[i]) {
                    GetDeps().insert(i);
                }
            }
        }
        std::size_t GetID() const {
            return id_;
        }
        StrCursor& GetCursor() {
            return cursor_;
        }
        StrCursor const& GetCursor() const {
            return cursor_;
        }
        const SSet& GetRefs() const {
            return refs_;
        }
        SSet& GetRefs() {
            return refs_;
        }
        const SSet& GetDeps() const {
            return deps_;
        }
        SSet& GetDeps() {
            return deps_;
        }

        void IntersectRefs(SSet const& referencedAttrsIds, AttrMap& attributeMap) {
            for (auto referenced_it = GetRefs().begin(); referenced_it != GetRefs().end();) {
                auto referenced = *referenced_it;
                if (referencedAttrsIds.find(referenced) == std::end(referencedAttrsIds)) {
                    referenced_it = GetRefs().erase(referenced_it);
                    attributeMap.at(referenced).RemoveDependent(GetID());
                } else {
                    referenced_it++;
                }
            }
        }

        void RemoveDependent(std::size_t dep) {
            GetDeps().erase(dep);
        }
        bool HasFinished() const {
            return !GetCursor().HasNext() || (GetRefs().empty() && GetDeps().empty());
        }
        static int CompareID(std::size_t id_lhs, std::size_t id_rhs) {
            if (id_lhs > id_rhs) {
                return 1;
            } else if (id_lhs < id_rhs) {
                return -1;
            }
            return 0;
        }
        int CompareTo(Attribute const& other) const {
            if (!GetCursor().HasNext() && !other.GetCursor().HasNext()) {
                return CompareID(GetID(), other.GetID());
            } else if (!GetCursor().HasNext()) {
                return 1;
            } else if (!other.GetCursor().HasNext()) {
                return -1;
            }

            int order = GetCursor().GetValue().compare(other.GetCursor().GetValue());
            if (order == 0) {
                return CompareID(GetID(), other.GetID());
            }
            return order;
        }
    };

private:
    template <ColTypeImpl col_type, typename... Args>
    decltype(auto) CreateConcreteChunkProcessor(ColTypeImpl value, Args&&... args) const {
        auto create = [&args...](auto i) -> std::unique_ptr<BaseTableProcessor> {
            constexpr auto key_type_v = static_cast<KeyTypeImpl>(static_cast<std::size_t>(i));
            using ConcreteChunkProcessor = ChunkProcessor<key_type_v, col_type>;
            return std::make_unique<ConcreteChunkProcessor>(std::forward<Args>(args)...);
        };
        return boost::mp11::mp_with_index<std::tuple_size<details::KeysTuple>>(
                static_cast<std::size_t>(value), create);
    }

    decltype(auto) CreateChunkProcessor(std::filesystem::path const& path,
                                        SpilledFilesManager& manager) const {
        BaseTableProcessor::DatasetConfig dataset{
                .path = path, .separator = separator_, .has_header = has_header_};
        auto col_type_v = static_cast<ColTypeImpl>(col_type._to_index());

        if (col_type == +ColType::SET) {
            return CreateConcreteChunkProcessor<ColTypeImpl::SET>(
                    col_type_v, manager, dataset, ram_limit, mem_check_frequency);
        } else {
            return CreateConcreteChunkProcessor<ColTypeImpl::VECTOR>(
                    col_type_v, manager, dataset, ram_limit, threads_count);
        }
    }

    std::filesystem::path temp_dir = "temp";
    std::size_t ram_limit;
    std::size_t mem_check_frequency = 100000;
    std::size_t threads_count = 1;
    ColType col_type = +ColType::SET;
    KeyType key_type = +KeyType::STRING_VIEW;

    std::vector<UID> result_;
    AttrMap attrs;
    std::priority_queue<Attribute*, std::vector<Attribute*>,
                        std::function<int(Attribute*, Attribute*)>>
            attributeObjectQueue{
                    [](Attribute* lhs, Attribute* rhs) { return lhs->CompareTo(*rhs) >= 0; }};
    struct InnerState {
        std::size_t n_cols = 0;
        std::vector<std::string> max_values{};
        std::vector<std::size_t> number_of_columns{};
        std::vector<std::size_t> tableColumnStartIndexes{};
    } state;

protected:
    unsigned long long ExecuteInternal() final;
    void PreprocessData();
    void InitializeAttributes();
    virtual void ComputeUIDs();
    void Output();
    void RegisterUID(UID uid);

    static void printUID(std::ostream& out, UID const& uid, std::vector<std::string>& columns) {
        const auto& [dep, ref] = uid;
        out << "[" << columns[dep] << "," << columns[ref] << "]";
    }
    void printResult(std::ostream& out) const {
        std::vector<std::string> columns;
        columns.reserve(state.n_cols);
        for (std::size_t i = 0; i != paths_.size(); ++i) {
            for (std::size_t j = 0; j != state.number_of_columns[i]; ++j) {
                std::string name = std::to_string(i) + "." + std::to_string(j);
                columns.emplace_back(name);
            }
        }
        for (UID const& uid : result_) {
            out << uid.first << "->" << uid.second ;
            out << std::endl;
        }
        out << std::endl;
    }

public:
    explicit Spider(): IDAlgorithm({}) {}

    void FitInternal(model::IDatasetStream&) override {}
    const std::vector<UID>& getUIDs() const {
        return result_;
    }
};

}  // namespace algos
