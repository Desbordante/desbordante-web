#pragma once

#include <vector>

#include "id_algorithm.h"
#include <queue>
#include <condition_variable>
#include <thread>
#include <iostream>
namespace algos {

class BruteForce : public IDAlgorithm {
public:
    using UID = std::pair<std::size_t, std::size_t>;

private:
    static constexpr auto TEMP_DIR = "temp";
    bool is_null_equal_null_ = true;

protected:
    std::size_t n_cols_ = 0;
    std::vector<UID> result_;

    static std::filesystem::path GetNthFilePath(std::size_t n) {
        return std::filesystem::path{TEMP_DIR} / std::to_string(n);
    }
    static std::unique_ptr<std::ofstream> GetNthOFStream(std::size_t n) {
        return std::make_unique<std::ofstream>(GetNthFilePath(n));
    }
    static std::unique_ptr<std::ifstream> GetNthIFStream(std::size_t n) {
        return std::make_unique<std::ifstream>(GetNthFilePath(n));
    }

    template <typename T>
    class Cursor {
        std::unique_ptr<std::ifstream> fd;
        T value;

    public:
        explicit Cursor(std::size_t n) : fd(GetNthIFStream(n)) {
            value = GetNext();
        }
        T const& GetValue() const {
            return value;
        }
        T const& GetNext() {
            *fd >> value >> std::ws;
            return GetValue();
        }
        bool HasNext() const {
            return !fd->eof();
        }
        void print(std::ostream& out) const {
            out << value << " " << std::boolalpha << HasNext();
        }
    };

    unsigned long long ExecuteInternal() final;
//    void processTable(model::IDatasetStream& stream);
//    void createSortedColumns();

    virtual void ComputeUIDs();

    std::size_t getColsNumber() const {
        return n_cols_;
    }

    bool checkUID(UID const& uid) const;
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
    explicit BruteForce(Config const& config) :
          IDAlgorithm(config, { "Data processing", "IND calculation" }) {}

    void FitInternal(model::IDatasetStream&) override {}
    const std::vector<UID>& getUIDs() const {
        return result_;
    }
};

}  // namespace algos
