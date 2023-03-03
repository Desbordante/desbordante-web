#include "spider.h"

#include <iostream>
#include <set>

using namespace algos;

void Spider::PreprocessData() {
    SpilledFilesManager spilled_manager{temp_dir};

    for (const auto& path : paths_) {
        std::cout << "PROCESS NEXT DATASET\n";
        std::cout << "Dataset: " << path.filename() << std::endl;

        auto processor = CreateChunkProcessor(path, spilled_manager);
        processor->Execute();
        state.tableColumnStartIndexes.emplace_back(state.n_cols);
        state.n_cols += processor->GetHeaderSize();
        state.number_of_columns.emplace_back(processor->GetHeaderSize());

        std::cout << "DATASET PROCESSED\n\n";
    }
    state.max_values = spilled_manager.GetMaxValues();
}


unsigned long long Spider::ExecuteInternal() {
    auto preprocess_time = std::chrono::system_clock::now();
    PreprocessData();
    auto preprocessing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - preprocess_time);

    std::cout << "Initialize attributes" << std::endl;
    auto init_time = std::chrono::system_clock::now();
    InitializeAttributes();
    auto initializing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - init_time);

    std::cout << "Compute UIDs" << std::endl;
    auto checking_time = std::chrono::system_clock::now();
    ComputeUIDs();
    auto checking = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - checking_time);

    std::cout << "SUMMARY INFO\n";

    std::cout << "PreprocessingTime: " << preprocessing_time.count() << std::endl;
    std::cout << "InitializeTime: " << initializing_time.count() << std::endl;
    std::cout << "CompareTime: " << checking.count() << std::endl;
    Output();
    std::cout << "Deps: " << result_.size() << std::endl;
    return 0;
}

void Spider::RegisterUID(UID uid) {
    result_.emplace_back(std::move(uid));
}

void Spider::InitializeAttributes() {
    attrs.reserve(state.n_cols);
    for (std::size_t attr_id = 0; attr_id != state.n_cols; ++attr_id) {
        auto path = SpilledFilesManager::GetResultColumnPath(attr_id);
        auto attr_ptr = new Attribute{attr_id, state.n_cols, StrCursor{path}, state.max_values};
        auto [attr_it, is_inserted] = attrs.emplace(attr_id, std::move(*attr_ptr));
        if (!is_inserted) {
            throw std::runtime_error("New attribute wasn't inserted " + std::to_string(attr_id));
        }
        attr_ptr = &attr_it->second;
        if (!attr_ptr->HasFinished()) {
            attributeObjectQueue.emplace(attr_ptr);
        }
    }
}

void Spider::ComputeUIDs() {
    Attribute::SSet attr_ids;
    while (!attributeObjectQueue.empty()) {
        auto topAttribute = attributeObjectQueue.top();
        attributeObjectQueue.pop();

        attr_ids.emplace(topAttribute->GetID());
        while (!attributeObjectQueue.empty() &&
               topAttribute->GetCursor().GetValue() ==
                       (attributeObjectQueue.top()->GetCursor().GetValue())) {
            attr_ids.emplace(attributeObjectQueue.top()->GetID());
            attributeObjectQueue.pop();
        }
        for (auto attr_id : attr_ids) {
            attrs.at(attr_id).IntersectRefs(attr_ids, attrs);
        }
        for (auto attr_id : attr_ids) {
            auto& spiderAttribute = attrs.at(attr_id);
            if (!spiderAttribute.HasFinished()) {
                spiderAttribute.GetCursor().GetNext();
                attributeObjectQueue.emplace(&spiderAttribute);
            }
        }
        attr_ids.clear();
    }
}

void Spider::Output() {
    for (const auto& [depID, attr] : attrs) {
        for (auto const& refID : attr.GetRefs()) {
            RegisterUID({depID, refID});
        }
    }
}
