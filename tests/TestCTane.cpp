#include <filesystem>

#include "gtest/gtest.h"

#include "CTane.h"
#include "Datasets.h"

namespace fs = std::filesystem;

namespace tests {

class CFDAlgorithmTest : public ::testing::Test {
public:
    using Column = std::string;
    using PatternValue = std::string;
    using ItemType = std::pair<Column, PatternValue>;
    using CFDFromString = std::pair<std::vector<ItemType>, ItemType>;
protected:
    static std::unique_ptr<algos::CFDAlgorithm> CreateAlgorithmInstance(
        unsigned int max_lhs,
        double min_sup, double min_conf, std::filesystem::path const& path,
        char separator = ',', bool hasHeader = true) {
        algos::CFDAlgorithm::Config const config = {path,
                                                    separator,
                                                    hasHeader,
                                                    true,
                                                    max_lhs,
                                                    1,
                                                    {{"minsup", min_sup}, {"minconf", min_conf}}};
        return std::make_unique<algos::CTane>(config);
    }
};

std::string CFDFromStringToString(CFDAlgorithmTest::CFDFromString const& cfd) {
    std::string result;
    for (const auto& [item, pattern]: cfd.first) {
        if (!result.empty()) {
            result += ", ";
        } else {
            result += "(";
        }
        result += item;
        if (pattern != "_") {
            result += "=" + pattern;
        }
    }
    result += ") -> ";

    result += cfd.second.first;
    if (cfd.second.second != "_") {
        result += "=" + cfd.second.second;
    }
    return result;
}

std::vector<std::string> GetCFDListString(std::vector<CFDAlgorithmTest::CFDFromString> const& expected) {
    std::vector<std::string> result;
    for (const auto& dep : expected) {
        result.emplace_back(CFDFromStringToString(dep));
    }
    return result;
}

void CheckCFDsListsEquality(
    std::vector<std::string> const& actual,
    std::vector<CFDAlgorithmTest::CFDFromString> const& expected) {
        ASSERT_EQ(actual.size(), expected.size())
            << "count of generated CFDs does not match: expected "
            << expected.size() << ", got " << actual.size();
        const auto expected_transformed = GetCFDListString(expected);
        for (auto const& dep : expected_transformed) {
            if (std::find(actual.begin(), actual.end(), dep) == actual.end()) {
                FAIL() << "generated cfd ='" << dep << "'doesn't present in expected";
            }
        }
}

TEST_F(CFDAlgorithmTest, ExactCFDsEmployee) {
    auto const path = fs::current_path() / "inputData" / "EmployeeSmall.csv";
    auto algorithm = CreateAlgorithmInstance(2, 3, 1, path, ',', true);
    algorithm->Execute();
    auto const deps = algorithm->CFDListString();

    std::vector<CFDAlgorithmTest::CFDFromString> const expected_deps = {
        { { { "CC", "44" } }, { "AC", "_" } },
        { { { "CC", "44" } }, { "AC", "131" } },
        { { { "AC", "_" }, { "city", "_"} }, { "CC", "_" } },
        { { { "CC", "_" }, { "city", "EDI"} }, { "AC", "_" } },
    };
    CheckCFDsListsEquality(deps, expected_deps);
}

} // namespace tests
