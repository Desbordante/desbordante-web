#include "spider.h"

#include <iostream>
#include <set>

using namespace algos;

unsigned long long Spider::ExecuteInternal() {
    auto preprocess_time = std::chrono::system_clock::now();
    PreprocessData();
    auto preprocessing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - preprocess_time);

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

    std::cout << "SUMMARY INFO\n";

    std::cout << "PreprocessingTime: " << preprocessing_time.count() << std::endl;
    std::cout << "InitializeTime: " << initializing_time.count() << std::endl;
    std::cout << "CompareTime: " << checking.count() << std::endl;
    Output();
    std::cout << "Deps: " << result_.size() << std::endl;
    return 0;
}

void Spider::registerUID(UID uid) {
    result_.emplace_back(std::move(uid));
}

void Spider::initializeAttributes() {
    objects.reserve(state.n_cols);
    for (std::size_t attribute = 0; attribute != state.n_cols; ++attribute) {
        auto path = TableProcessor<VectorStringView>::GeneratePath(attribute);
        auto spiderAttr = std::make_unique<Attribute>(
                attribute, state.n_cols, std::make_shared<StrCursor>(path), state.max_values);
        if (!spiderAttr->hasFinished()) {
            attributeObjectQueue.emplace(spiderAttr.get());
        }
        objects.insert({attribute, std::move(spiderAttr)});
    }
}

void Spider::ComputeUIDs() {
    Attribute::SSet min;
    while (!attributeObjectQueue.empty()) {
        auto topAttribute = attributeObjectQueue.top();
        attributeObjectQueue.pop();

        min.emplace(topAttribute->getID());
        while (!attributeObjectQueue.empty() &&
               topAttribute->GetCursor().GetValue() ==
                       (attributeObjectQueue.top()->GetCursor().GetValue())) {
            min.emplace(attributeObjectQueue.top()->getID());
            attributeObjectQueue.pop();
        }
        for (auto attribute : min) {
            objects.at(attribute)->IntersectRefs(min, objects);
        }
        for (auto attribute : min) {
            auto spiderAttribute = objects.at(attribute).get();
            if (!spiderAttribute->hasFinished()) {
                spiderAttribute->GetCursor().GetNext();
                attributeObjectQueue.emplace(spiderAttribute);
            }
        }
        min.clear();
    }
}

void Spider::Output() {
    for (auto& [depID, attr] : objects) {
        for (auto& refID : attr->GetRefs()) {
            registerUID({depID, refID});
        }
    }
}
