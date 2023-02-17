#include "brute_force.h"

#include <iostream>
#include <set>

using namespace algos;

unsigned long long BruteForce::ExecuteInternal() {
    auto load_time = std::chrono::system_clock::now();
//    createSortedColumns();
    PreprocessData();
    auto processing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - load_time);

    auto checking_time = std::chrono::system_clock::now();
    ComputeUIDs();
    auto checking = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - checking_time);

    std::cout << processing_time.count() << " | " << checking.count() << std::endl;
    std::cout << "loadTime: " << processing_time.count() << std::endl;
    std::cout << "compareTime: " << checking.count() << std::endl;
    std::cout << "Found " << result_.size() << " UIDs" << std::endl;

//    printResult(std::cout);
    for (auto const& id: result_) {
        std::cout << id.first << "->" << id.second << std::endl;
    }
    return 0;
}

//void BruteForce::processTable(model::IDatasetStream& stream) {
//    auto n = stream.GetNumberOfColumns();
//    std::vector<std::unique_ptr<std::ofstream>> fds;
//    fds.reserve(n);
//    std::filesystem::create_directory(TEMP_DIR);
//    for (std::size_t i = 0; i != n; ++i) {
//        fds.emplace_back(GetNthOFStream(n_cols_ + i));
//    }
//    using ColumnValues = std::vector<std::string>;
//    std::vector<ColumnValues> data(n, ColumnValues{});
//    while (stream.HasNextRow()) {
//        auto row = stream.GetNextRow();
//        if (row.size() != n) {
//            continue;
//        }
//        for (std::size_t i = 0; i != n; ++i) {
//            data[i].emplace_back(row[i]);
//        }
//    }
//    auto sort_and_save = [&data, &fds](std::size_t i) {
//        auto& values = data[i];
//        std::sort(values.begin(), values.end());
//        values.erase(unique(values.begin(), values.end()), values.end());
//
//        for (std::string const& value : values) {
//            *fds[i] << value << '\n';
//        }
//    };
//#if true
//    std::vector<std::thread> threads;
//    for (std::size_t i = 0; i < n; ++i) {
//        threads.emplace_back(std::thread(sort_and_save, i));
//    }
//    for (auto& th : threads) {
//        th.join();
//    }
//#else
//    for (std::size_t i = 0; i < n; ++i) {
//        sort_and_save(i);
//    }
//#endif
//    n_cols_ += n;
//    for (auto& values: data) {
//        stats.max_values.emplace_back(*values.rbegin());
//    }
//}

bool BruteForce::checkUID(UID const& uid) const {
    const auto& [dep, ref] = uid;
    auto dc = Cursor<std::string>(dep);
    auto rc = Cursor<std::string>(ref);
    if (column_stats_.max_values[dep] > column_stats_.max_values[ref]) {
        return false;
    }
    while (true) {
        if (dc.GetValue() == rc.GetValue()) {
            if (!dc.HasNext()) {
                return true;
            }
            dc.GetNext();
            if (!rc.HasNext()) {
                return false;
            }
            rc.GetNext();
        } else if (dc.GetValue() > rc.GetValue()) {
            if (!rc.HasNext()) {
                return false;
            }
            rc.GetNext();
        } else {
            return false;
        }
    };
}

void BruteForce::registerUID(UID uid) {
    result_.emplace_back(std::move(uid));
}

//void BruteForce::createSortedColumns() {
//    for (auto& stream : streams_) {
//        processTable(*stream);
//    }
//};

void BruteForce::ComputeUIDs() {
    for (std::size_t i = 0; i != n_cols_; ++i) {
        for (std::size_t j = 0; j != n_cols_; ++j) {
            if (i == j) {
                continue;
            }
            UID uid{i, j};
            if (checkUID(uid)) {
                registerUID(uid);
            }
        }
    }
}
