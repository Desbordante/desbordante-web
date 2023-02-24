#pragma once

#include <algorithm>
#include <filesystem>
#include <iostream>
#include <memory>
#include <string>
#include <sys/sysinfo.h>
#include <thread>
#include <utility>
#include <vector>
#include <set>

#include "column_reader.h"
#include "idataset_stream.h"

namespace model {
class ColumnReader {
public:
    struct ColumnsStats {
        std::size_t n_cols = 0;
        std::vector<std::string> max_values;
        std::vector<std::size_t> tableColumnStartIndexes;
    };
    using ColumnValues = std::vector<std::string>;
    // 753.9 MB -(std::vector)-> (-3364 RAM) -(std::set)-> (-566 mb) -(reserve)-> (-3080)
//    using ColumnValues = std::set<std::string>;

private:
    using StreamsType = std::vector<std::unique_ptr<model::IDatasetStream>>&;
    StreamsType& streams_;
    std::string temp_dir_;
    std::size_t memory_check_frequency_;
    ColumnsStats* stats_;
    std::size_t ram_limit;

    std::filesystem::path GetNthFilePath(std::size_t n) {
        return std::filesystem::path{temp_dir_} / std::to_string(n);
    }
    std::unique_ptr<std::ofstream> GetNthOFStream(std::size_t n) {
        return std::make_unique<std::ofstream>(GetNthFilePath(n));
    }
    std::unique_ptr<std::ifstream> GetNthIFStream(std::size_t n) {
        return std::make_unique<std::ifstream>(GetNthFilePath(n));
    }

    static void SortAndSaveToDisk(std::ofstream& fd, ColumnValues& values) {
        std::sort(values.begin(), values.end());
        values.erase(unique(values.begin(), values.end()), values.end());
        for (std::string const& value : values) {
            fd << value << '\n';
        }
    }

    template <typename T>
    static auto toMB(T value) {
        return (std::size_t)(std::abs((double)value)) >> 20;
    }
    template <typename T>
    static auto toGB(T value) {
        return (std::size_t)(std::abs((double)value)) >> 30;
    }
    template <typename T>
    static auto printGB(T value, bool is_negative) {
        std::cout << " (" << (is_negative ? "-" : "") << toGB(value) << " gb)";
    }
    template <typename T>
    static auto printMB(T value, bool is_negative) {
        std::cout << " (" << (is_negative ? "-" : "") << toMB(value) << " mb)";
    }

    template <typename T>
    static auto PrintSingleOption(std::string const& name, T value) {
        std::cout << name << ": ";
        bool is_negative = value < 0;
        printMB(value, is_negative);
        printGB(value, is_negative);
        std::cout << std::endl;
    }

    static auto PrintAndGetSysInfo(bool print = true) {
        auto info = std::make_unique<struct sysinfo>();
        sysinfo(info.get());
        if (print) {
//            PrintSingleOption("totalram", info->totalram);
            PrintSingleOption("freeram", info->freeram);
//            PrintSingleOption("sharedram", info->sharedram);
//            PrintSingleOption("bufferram", info->bufferram);
            std::cout << std::endl;
        }
        return info;
    }
    static void PrintDiff(struct sysinfo* lhs, struct sysinfo* rhs) {
        PrintSingleOption("freeram", (double)lhs->freeram - rhs->freeram);
//        PrintSingleOption("sharedram", (double)lhs->sharedram - rhs->sharedram);
//        PrintSingleOption("bufferram", (double)lhs->bufferram - rhs->bufferram);
        std::cout << "\n";
    }

    void ProcessTable(model::IDatasetStream& stream) {
        auto before = PrintAndGetSysInfo();
        auto n = stream.GetNumberOfColumns();
        std::vector<std::unique_ptr<std::ofstream>> fds;
        fds.reserve(n);
        std::filesystem::create_directory(temp_dir_);
        for (std::size_t i = 0; i != n; ++i) {
            fds.emplace_back(GetNthOFStream(stats_->n_cols + i));
        }
//        std::size_t count = 0;
        std::vector<ColumnValues> data(n, ColumnValues {});
        for (auto& values : data) {
            values.reserve(6001215);
        }

        std::vector<std::string> swapped{};
        while (stream.HasNextRow()) {
            auto row = stream.GetNextRow();
            if (row.size() != n) {
                continue;
            }
            for (std::size_t i = 0; i != n; ++i) {
                data[i].emplace_back(row[i]);
            }
        }
        std::cout << "MAX\n";
        PrintDiff(PrintAndGetSysInfo().get(), before.get());

        std::vector<std::thread> threads;
        for (std::size_t i = 0; i < n; ++i) {
            threads.emplace_back(
                    std::thread{[&fds, &data, i]() { SortAndSaveToDisk(*fds[i], data[i]); }});
        }
        for (auto& th : threads) {
            th.join();
        }

        stats_->tableColumnStartIndexes.emplace_back(stats_->n_cols);
        stats_->n_cols += n;
        for (auto& values : data) {
            stats_->max_values.emplace_back(*values.rbegin());
        }
        std::cout << "Last\n";
        auto after = PrintAndGetSysInfo();
        PrintDiff(after.get(), before.get());
    }

public:
    ColumnReader(StreamsType& streams, std::string temp_dir, std::size_t memory_check_frequency,
                 std::size_t ram_limit)
        : streams_(streams),
          temp_dir_(std::move(temp_dir)),
          memory_check_frequency_(memory_check_frequency),
          stats_(new ColumnsStats{}),
          ram_limit(ram_limit) {}

    void Execute() {
        for (auto& stream : streams_) {
            ProcessTable(*stream);
        }
//        PrintAndGetSysInfo();
    }

    ColumnsStats* ReleaseColumnStats() {
        return stats_;
    }
};

}  // namespace model

// #if true
// #else
////        for (std::size_t i = 0; i < n; ++i) {
////            sort_and_save(i);
////        }
// #endif