#include "spider.h"

#include <iostream>
#include <set>

using namespace algos;

unsigned long long Spider::ExecuteInternal() {
    std::cout << "CreateSortedColumns" << std::endl;
    auto load_time = std::chrono::system_clock::now();
    PreprocessData();
    auto processing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - load_time);

    std::cout << "Initialize attributes" << std::endl;
    auto init_time = std::chrono::system_clock::now();
    initializeAttributes();
    auto initializing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - init_time);
    std::cout << "Compute UIDs" << std::endl;
    auto checking_time = std::chrono::system_clock::now();
    ComputeUIDs();
    auto checking = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - checking_time);

    std::cout << "loadTime: " << processing_time.count() << std::endl;
    std::cout << "initializeTime: " << initializing_time.count() << std::endl;
    std::cout << "compareTime: " << checking.count() << std::endl;
    Output();
    //    printResult(std::cout);
    std::cout << "Found " << result_.size() << " UIDs" << std::endl;

    //    for (auto const& id : result_) {
    //        std::cout << id.first << "->" << id.second << std::endl;
    //    }
    return 0;
}

// void Spider::processTable(model::IDatasetStream& stream) {
//     auto n = stream.GetNumberOfColumns();
//     std::vector<std::unique_ptr<std::ofstream>> fds;
//     fds.reserve(n);
//     std::filesystem::create_directory(TEMP_DIR);
//     for (std::size_t i = 0; i != n; ++i) {
//         fds.emplace_back(GetNthOFStream(n_cols_ + i));
//     }
//     using ColumnValues = std::vector<std::string>;
//     std::vector<ColumnValues> data(n, ColumnValues{});
//     while (stream.HasNextRow()) {
//         auto row = stream.GetNextRow();
//         if (row.size() != n) {
//             continue;
//         }
//         for (std::size_t i = 0; i != n; ++i) {
//             data[i].emplace_back(row[i]);
//         }
//     }
//     auto sort_and_save = [&data, &fds](std::size_t i) {
//         auto& values = data[i];
//         std::sort(values.begin(), values.end());
//         values.erase(unique(values.begin(), values.end()), values.end());
//
//         for (std::string const& value : values) {
//             *fds[i] << value << '\n';
//         }
//     };
// #if true
//     std::vector<std::thread> threads;
//     for (std::size_t i = 0; i < n; ++i) {
//         threads.emplace_back(std::thread(sort_and_save, i));
//     }
//     for (auto& th : threads) {
//         th.join();
//     }
// #else
//     for (std::size_t i = 0; i < n; ++i) {
//         sort_and_save(i);
//     }
// #endif
//     tableColumnStartIndexes.emplace_back(n_cols_);
//     n_cols_ += n;
//     for (auto& values : data) {
//         max_values.emplace_back(*values.rbegin());
//     }
// }

void Spider::registerUID(UID uid) {
    result_.emplace_back(std::move(uid));
}

void Spider::initializeAttributes() {
    attributeId2attributeObject.reserve(column_stats_.n_cols);
    for (std::size_t table = 0; table < streams_.size(); table++) {
        std::size_t offset = column_stats_.tableColumnStartIndexes[table];
        std::size_t lastAttribute = offset + streams_[table]->GetNumberOfColumns();

        for (std::size_t attribute = offset; attribute < lastAttribute; attribute++) {
            auto spiderAttr = std::make_shared<Attribute>(
                    attribute, column_stats_.n_cols, std::make_shared<StrCursor>(GetNthIFStream(attribute)),
                    column_stats_.max_values);
            attributeId2attributeObject.insert({attribute, spiderAttr});

            if (!spiderAttr->hasFinished()) {
                attributeObjectQueue.emplace(spiderAttr);
            }
        }
    }
}

void Spider::ComputeUIDs() {
    Attribute::SSet topAttributes;
    while (!attributeObjectQueue.empty()) {
        auto topAttribute = attributeObjectQueue.top();
        attributeObjectQueue.pop();

        topAttributes.emplace(topAttribute->getID());
        while (!attributeObjectQueue.empty() &&
               topAttribute->GetCursor().GetValue() ==
                       (attributeObjectQueue.top()->GetCursor().GetValue())) {
            topAttributes.emplace(attributeObjectQueue.top()->getID());
            attributeObjectQueue.pop();
        }
        for (auto attribute : topAttributes) {
            attributeId2attributeObject.at(attribute)->intersectRefs(topAttributes,
                                                                     attributeId2attributeObject);
        }
        for (auto attribute : topAttributes) {
            auto spiderAttribute = attributeId2attributeObject.at(attribute);
            spiderAttribute->GetCursor().GetNext();
            if (!spiderAttribute->hasFinished()) {
                attributeObjectQueue.emplace(spiderAttribute);
            }
        }
        topAttributes.clear();
    }
}

void Spider::Output() {
    std::unordered_map<std::size_t, Attribute::SSet> dep2ref;
    dep2ref.reserve(column_stats_.n_cols);
    for (auto& [key, spiderAttribute] : attributeId2attributeObject) {
        if (!spiderAttribute->getRefs().empty()) {
            dep2ref.emplace(spiderAttribute->getID(), Attribute::SSet{spiderAttribute->getRefs()});
        }
    }
    for (auto& [depID, refs] : dep2ref) {
        for (auto& refID : refs) {
            registerUID({depID, refID});
        }
    }
}
