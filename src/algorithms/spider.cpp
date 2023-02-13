#include "spider.h"

#include <iostream>
#include <set>

using namespace algos;

unsigned long long Spider::ExecuteInternal() {
    auto load_time = std::chrono::system_clock::now();
    std::cout << "CreateSortedColumns" << std::endl;
    createSortedColumns();
    auto processing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - load_time);

    auto checking_time = std::chrono::system_clock::now();
    std::cout << "Initialize attributes" << std::endl;
    initializeAttributes();
    std::cout << "Compute UIDs" << std::endl;
    ComputeUIDs();
    auto checking = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - checking_time);

    std::cout << processing_time.count() << " | " << checking.count() << std::endl;
    std::cout << "Processing: " << processing_time.count() << std::endl;
    std::cout << "Checking: " << checking.count() << std::endl;
    Output();
    std::cout << "Found " << result_.size() << " UIDs" << std::endl;

    printResult(std::cout);
    std::cout << "Found " << result_.size() << " UIDs" << std::endl;
    return 0;
}

void Spider::processTable(model::IDatasetStream& stream) {
    auto n = stream.GetNumberOfColumns();
    std::vector<std::unique_ptr<std::ofstream>> fds;
    fds.reserve(n);
    std::filesystem::create_directory(TEMP_DIR);
    for (std::size_t i = 0; i != n; ++i) {
        fds.emplace_back(GetNthOFStream(n_cols_ + i));
    }
    using ColumnValues = std::vector<std::string>;
    std::vector<ColumnValues> data(n, ColumnValues{});
    while (stream.HasNextRow()) {
        auto row = stream.GetNextRow();
        if (row.size() != n) {
            continue;
        }
        for (std::size_t i = 0; i != n; ++i) {
            data[i].emplace_back(row[i]);
        }
    }
    auto sort_and_save = [&data, &fds](std::size_t i) {
        auto& values = data[i];
        std::sort(values.begin(), values.end());
        values.erase(unique(values.begin(), values.end()), values.end());

        for (std::string const& value : values) {
            *fds[i] << value << '\n';
        }
    };
#if true
    std::vector<std::thread> threads;
    for (std::size_t i = 0; i < n; ++i) {
        threads.emplace_back(std::thread(sort_and_save, i));
    }
    for (auto& th : threads) {
        th.join();
    }
#else
    for (std::size_t i = 0; i < n; ++i) {
        sort_and_save(i);
    }
#endif
    tableColumnStartIndexes.emplace_back(n_cols_);
    n_cols_ += n;
    for (auto& values : data) {
        max_values.emplace_back(*values.rbegin());
    }
}


void Spider::registerUID(UID uid) {
    result_.emplace_back(std::move(uid));
}

void Spider::createSortedColumns() {
    for (auto& stream : streams_) {
        processTable(*stream);
    }
};
void Spider::initializeAttributes() {
    attributeId2attributeObject.reserve(n_cols_);

    for (std::size_t table = 0; table < streams_.size(); table++) {
        std::size_t firstAttribute = tableColumnStartIndexes[table];
        std::size_t lastAttribute = firstAttribute + streams_[table]->GetNumberOfColumns();

        for (std::size_t attribute = firstAttribute; attribute < lastAttribute; attribute++) {
            auto spiderAttr = std::make_shared<Attribute>(
                    attribute, n_cols_, std::make_shared<StrCursor>(GetNthIFStream(attribute)));
            attributeId2attributeObject.insert({attribute, spiderAttr});

            if (!spiderAttr->hasFinished()) {
                attributeObjectQueue.emplace(spiderAttr);
            }
        }
    }
}

void Spider::ComputeUIDs() {
    std::set<std::size_t> topAttributes;
    while (!attributeObjectQueue.empty()) {
        auto topAttribute = attributeObjectQueue.top();
//        std::cout << "top"<< topAttribute->getID() << '\n';
        attributeObjectQueue.pop();
//        std::cout << "pop " <<attributeObjectQueue.size() << std::endl;

        topAttributes.emplace(topAttribute->getID());
        while ((!attributeObjectQueue.empty()) &&
               topAttribute->GetCursor().GetValue() ==
                       (attributeObjectQueue.top()->GetCursor().GetValue())) {
            topAttributes.emplace(attributeObjectQueue.top()->getID());
            attributeObjectQueue.pop();
        }

        for (int attribute : topAttributes) {
//            std::cout << attribute << " -> [ ";
//            for (auto i : topAttributes) std::cout << i << " ";
//            std::cout << "]\n";
            attributeId2attributeObject.at(attribute)->intersectRefs(topAttributes,
                                                                    attributeId2attributeObject);
        }
        for (int attribute : topAttributes) {
            auto spiderAttribute = attributeId2attributeObject.at(attribute);
            spiderAttribute->GetCursor().GetNext();
            if (!spiderAttribute->hasFinished()) {
                attributeObjectQueue.emplace(spiderAttribute);
            }
        }

        topAttributes.clear();
    }
}

std::string Spider::GetTableNameFor(std::size_t id) const {
    for (std::size_t i = 1; i < tableColumnStartIndexes.size(); i++) {
        if (tableColumnStartIndexes[i] > id) {
            return streams_[i - 1]->GetRelationName();
        }
    }
    return streams_[n_cols_ - 1]->GetRelationName();
}
std::string Spider::GetColumnNameFor(std::size_t id) const {
    std::size_t cur_table = 0;
    while (id < streams_[cur_table]->GetNumberOfColumns()) {
        cur_table++;
        id -= streams_[cur_table]->GetNumberOfColumns();
    }
    return streams_[cur_table]->GetColumnName(cur_table);
}

void Spider::Output() {
    std::unordered_map<std::size_t, std::set<std::size_t>> dep2ref;
    dep2ref.reserve(n_cols_);
    for (auto& [key, spiderAttribute] : attributeId2attributeObject) {
//        std::cout << key << "--" << spiderAttribute->getRefs().size() << "<->" << spiderAttribute->getDeps().size() << "\n";
        if (!spiderAttribute->getRefs().empty()) {
            dep2ref.emplace(spiderAttribute->getID(),
                            std::set<std::size_t>(spiderAttribute->getRefs().begin(),
                                                  spiderAttribute->getRefs().end()));
        }
    }

    // Write the result to the resultReceiver
    for (auto& [depID, refs] : dep2ref) {
//        auto depTableName = GetTableNameFor(depID);
//        auto depColumnName = GetColumnNameFor(depID);

        for (auto& refID : refs) {
//            auto refTableName = GetTableNameFor(refID);
//            auto refColumnName = GetColumnNameFor(refID);
//            std::cout << depID << " " << refID << std::endl;
            registerUID({depID, refID});
//            std::cout << depTableName << "." << depColumnName << " -> " << refTableName << "."
//                      << refColumnName << std::endl;
            num_inds++;
        }
    }
}
