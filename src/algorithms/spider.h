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
        using SSet = std::set<std::size_t>;
        //        using ASet = std::set<Attribute>;
    private:
        std::size_t id_;
        std::shared_ptr<StrCursor> cursor_;
        SSet refs_, deps_;

    public:
        Attribute(std::size_t id, std::size_t n_cols, std::shared_ptr<StrCursor> cursor)
            : id_(id), cursor_(std::move(cursor)) {
            for (std::size_t i = 0; i != n_cols; ++i) {
                if (id_ == i) {
                    continue;
                }
                refs_.insert(i);
                deps_.insert(i);
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
        const SSet& getRefs() const {
            return refs_;
        }
        const SSet& getDeps() const {
            return deps_;
        }
        void intersectRefs(SSet referencedAttributes,
                           std::unordered_map<std::size_t, std::shared_ptr<Attribute>>& attributeMap) {
//            std::cout << "BSZ -> " << refs_.size() << std::endl;
            for (auto referenced_it = refs_.begin(); referenced_it != refs_.end();) {
                auto referenced = *referenced_it;
//                std::cout << "check " << referenced << " in [ ";
//                for (auto i : referencedAttributes) std::cout << i << " ";
//                std::cout << "]\n";
//                std::cout << "ISZ -> " << refs_.size() << std::endl;
                if (referencedAttributes.find(referenced) != std::end(referencedAttributes)) {
                    std::advance(referenced_it,1);
                    continue;
                }
                referenced_it = refs_.erase(referenced_it);
//                std::cout << "remove " << id_ << " for " << referenced << std::endl;
                attributeMap.at(referenced)->removeDependent(id_);
            }
//            std::cout << "ASZ -> " << refs_.size() << std::endl;

        }
//        void intersectRefs(SSet referencedAttributes,
//                           std::map<std::size_t, Attribute> attributeMap) {
//            for (const std::size_t& referenced : referencedAttributes) {
//                if (referencedAttributes.find(referenced) != std::end(referencedAttributes)) {
//                    continue;
//                }
//                attributeMap.at(referenced).removeDependent(id_);
//            }
//        }
        void removeDependent(std::size_t dep) {
//            std::cout << deps_.size() << "-";
            deps_.erase(dep);
//            std::cout << deps_.size() << std::endl;
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

private:
    static constexpr auto TEMP_DIR = "temp";
    bool is_null_equal_null_ = true;

protected:
    std::size_t num_inds = 0;
    std::size_t n_cols_ = 0;
    std::vector<UID> result_;
    std::vector<std::size_t> tableColumnStartIndexes;
    std::unordered_map<std::size_t, std::shared_ptr<Attribute>> attributeId2attributeObject;
    std::priority_queue<std::shared_ptr<Attribute>, std::vector<std::shared_ptr<Attribute>>,
                        std::function<int(std::shared_ptr<Attribute>, std::shared_ptr<Attribute>)>>
            attributeObjectQueue{
                    [](std::shared_ptr<Attribute> const& lhs, std::shared_ptr<Attribute> const& rhs)
                    { return rhs->CompareTo(*lhs); }};

    static std::filesystem::path GetNthFilePath(std::size_t n) {
        return std::filesystem::path{TEMP_DIR} / std::to_string(n);
    }
    static std::unique_ptr<std::ofstream> GetNthOFStream(std::size_t n) {
        return std::make_unique<std::ofstream>(GetNthFilePath(n));
    }
    static std::unique_ptr<std::ifstream> GetNthIFStream(std::size_t n) {
        return std::make_unique<std::ifstream>(GetNthFilePath(n));
    }

    unsigned long long ExecuteInternal() final;
    void processTable(model::IDatasetStream& stream);
    void createSortedColumns();
    void initializeAttributes();

    virtual void ComputeUIDs();
    void Output();
    std::string GetTableNameFor(std::size_t id) const;
    std::string GetColumnNameFor(std::size_t id) const;

    std::size_t getColsNumber() const {
        return n_cols_;
    }
    void registerUID(UID uid);

    static void printUID(std::ostream& out, UID const& uid, std::vector<std::string>& columns) {
        const auto& [dep, ref] = uid;
        out << "[" << columns[dep] << "," << columns[ref] << "]";
    }
    void printResult(std::ostream& out) const {
        std::vector<std::string> columns;
        columns.reserve(n_cols_);
        for (std::size_t i = 0; i != streams_.size(); ++i) {
            for (std::size_t j = 0; j != streams_[i]->GetNumberOfColumns(); ++j) {
                std::string name = std::to_string(i) + "." + streams_[i]->GetColumnName(j);
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
