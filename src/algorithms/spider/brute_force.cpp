#include "brute_force.h"

#include <iostream>
#include <set>
#include "model/cursor.h"

using namespace algos;

unsigned long long BruteForce::ExecuteInternal() {
    auto preprocess_time = std::chrono::system_clock::now();
    PreprocessData();
    auto preprocessing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - preprocess_time);

    auto checking_time = std::chrono::system_clock::now();
    ComputeUIDs();
    auto checking = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - checking_time);

    std::cout << "PreprocessingTime: " << preprocessing_time.count() << std::endl;
    std::cout << "CompareTime: " << checking.count() << std::endl;
    std::cout << "Deps: " << result_.size() << std::endl;

    return 0;
}

bool BruteForce::CheckUID(UID const& uid) {
    const auto& [dep, ref] = uid;
    StrCursor dep_cursor{GetNthFilePath(dep)};
    StrCursor ref_cursor{GetNthFilePath(ref)};
    while (true) {
        if (dep_cursor.GetValue() == ref_cursor.GetValue()) {
            if (!dep_cursor.HasNext()) {
                return true;
            }
            dep_cursor.GetNext();
            if (!ref_cursor.HasNext()) {
                return false;
            }
            ref_cursor.GetNext();
        } else if (dep_cursor.GetValue() > ref_cursor.GetValue()) {
            if (!ref_cursor.HasNext()) {
                return false;
            }
            ref_cursor.GetNext();
        } else {
            return false;
        }
    }
}

void BruteForce::RegisterUID(UID uid) {
    result_.emplace_back(std::move(uid));
}

void BruteForce::ComputeUIDs() {
    for (std::size_t dep = 0; dep != state.n_cols; ++dep) {
        for (std::size_t ref = 0; ref != state.n_cols; ++ref) {
            if (dep == ref || state.max_values[dep] > state.max_values[ref]) {
                continue;
            }
            UID uid{dep, ref};
            if (CheckUID(uid)) {
                RegisterUID(uid);
            }
        }
    }
}
