#include "brute_force.h"

#include <iostream>
#include <set>

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

bool BruteForce::checkUID(UID const& uid) const {
    const auto& [dep, ref] = uid;
    auto dc = Cursor<std::string>(dep);
    auto rc = Cursor<std::string>(ref);
    if (state.max_values[dep] > state.max_values[ref]) {
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
