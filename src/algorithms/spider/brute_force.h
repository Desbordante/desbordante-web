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
    std::vector<UID> result_;

    static std::filesystem::path GetNthFilePath(std::size_t n) {
        return std::filesystem::path{TEMP_DIR} / std::to_string(n);
    }

//    template <typename T = std::string>
//    class Cursor {
//        std::ifstream fd;
//        T value;
//
//    public:
//        explicit Cursor(std::size_t n) : fd(GetNthFilePath(n)) {
//            if (fd.fail()) {
//                throw std::runtime_error("Error while creating cursor");
//            }
//            GetValue() = GetNext();
//        }
//        T const& GetValue() const {
//            return value;
//        }
//        T& GetValue() {
//            return value;
//        }
//        T const& GetNext() {
//            fd >> GetValue() >> std::ws;
//            return GetValue();
//        }
//        bool HasNext() const {
//            return !fd.eof();
//        }
//    };

    unsigned long long ExecuteInternal() final;

    virtual void ComputeUIDs();

    static bool CheckUID(UID const& uid);
    void RegisterUID(UID uid);

    static void PrintUID(std::ostream& out, UID const& uid, std::vector<std::string>& columns) {
        const auto& [dep, ref] = uid;
        out << "[" << columns[dep] << "," << columns[ref] << "]";
    }
    void PrintResult(std::ostream& out) const {
        std::vector<std::string> columns;
        columns.reserve(state.n_cols);
        for (std::size_t i = 0; i != config_.paths.size(); ++i) {
            for (std::size_t j = 0; j != state.number_of_columns[i]; ++j) {
                std::string name = std::to_string(i) + "." + std::to_string(j);
                columns.emplace_back(name);
            }
        }
        for (UID const& uid : result_) {
            PrintUID(out, uid, columns);
            out << std::endl;
        }
        out << std::endl;
    }

public:
    explicit BruteForce(Config const& config) :
          IDAlgorithm(config, { "Data processing", "IND calculation" }) {}

    void FitInternal(model::IDatasetStream&) override {}
    const std::vector<UID>& GetUIDs() const {
        return result_;
    }
};

}  // namespace algos
