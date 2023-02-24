#pragma once

#include <map>
#include <set>
#include <string>
#include <utility>

#include "brute_force.h"
#include "model/cursor.h"

namespace algos {

class Spider : public IDAlgorithm {
public:
    using StrCursor = Cursor<std::string>;
    using UID = std::pair<std::size_t, std::size_t>;

    class Attribute {
    public:
        using SSet = std::set<std::size_t>;  // unordered_set

    private:
        std::size_t id_;
        std::shared_ptr<StrCursor> cursor_;
        SSet refs_, deps_;

    public:
        Attribute(std::size_t id, std::size_t n_cols, std::shared_ptr<StrCursor> cursor,
                  std::vector<std::string> const& max_values)
            : id_(id), cursor_(std::move(cursor)) {
            for (std::size_t i = 0; i != n_cols; ++i) {
                if (id_ == i) {
                    continue;
                }

                if (max_values[id_] <= max_values[i]) {
                    refs_.insert(i);
                }
                if (max_values[id_] >= max_values[i]) {
                    deps_.insert(i);
                }
            }
        }
        std::size_t getID() const {
            return id_;
        }
        StrCursor& GetCursor() {
            return *cursor_;
        }
        StrCursor const& GetCursor() const {
            return *cursor_;
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

        void IntersectRefs(
                SSet const& referencedAttributes,
                std::unordered_map<std::size_t, std::unique_ptr<Attribute>>& attributeMap) {
            for (auto referenced_it = refs_.begin(); referenced_it != refs_.end();) {
                auto referenced = *referenced_it;
                if (referencedAttributes.find(referenced) == std::end(referencedAttributes)) {
                    referenced_it = refs_.erase(referenced_it);
                    attributeMap.at(referenced)->removeDependent(id_);
                } else {
                    referenced_it++;
                }
            }
        }

        void removeDependent(std::size_t dep) {
            GetDeps().erase(dep);
        }
        bool hasFinished() {
            return !cursor_->HasNext() || (refs_.empty() && deps_.empty());
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
            if ((!GetCursor().HasNext()) && (!other.GetCursor().HasNext())) {
                return CompareID(id_, other.id_);
            }

            if (!GetCursor().HasNext()) {
                return 1;
            }
            if (!other.GetCursor().HasNext()) {
                return -1;
            }

            int order = GetCursor().GetValue().compare(other.GetCursor().GetValue());
            if (order == 0) {
                return CompareID(id_, other.id_);
            }
            return order;
        }
    };
    using SMap = std::unordered_map<std::size_t, std::unique_ptr<Attribute>>;

protected:
    std::vector<UID> result_;
    SMap objects;
    std::priority_queue<Attribute*, std::vector<Attribute*>,
                        std::function<int(Attribute*, Attribute*)>>
            attributeObjectQueue{
                    [](Attribute* lhs, Attribute* rhs) { return lhs->CompareTo(*rhs) >= 0; }};

    unsigned long long ExecuteInternal() final;
    void initializeAttributes();
    virtual void ComputeUIDs();
    void Output();
    void registerUID(UID uid);

    static void printUID(std::ostream& out, UID const& uid, std::vector<std::string>& columns) {
        const auto& [dep, ref] = uid;
        out << "[" << columns[dep] << "," << columns[ref] << "]";
    }
    void printResult(std::ostream& out) const {
        std::vector<std::string> columns;
        columns.reserve(state.n_cols);
        for (std::size_t i = 0; i != config_.paths.size(); ++i) {
            for (std::size_t j = 0; j != state.number_of_columns[i]; ++j) {
                std::string name = std::to_string(i) + "." + std::to_string(j);
                columns.emplace_back(name);
            }
        }
        for (UID const& uid : result_) {
            printUID(out, uid, columns);
            out << std::endl;
        }
        out << std::endl;
    }

public:
    explicit Spider(Config const& config)
        : IDAlgorithm(config, {"Data processing", "IND calculation"}) {}

    void FitInternal(model::IDatasetStream&) override {}
    const std::vector<UID>& getUIDs() const {
        return result_;
    }
};

}  // namespace algos
