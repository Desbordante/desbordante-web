#include <algorithm>
#include <cstring>
#include <fcntl.h>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <malloc.h>
#include <memory>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <sys/mman.h>
#include <sys/stat.h>
#include <sys/sysinfo.h>
#include <thread>
#include <unistd.h>
#include <utility>
#include <vector>

#include "algorithms/algo_factory.h"
#include "algorithms/ar_algorithm_enums.h"
#include "algorithms/create_primitive.h"
#include "algorithms/metric/enums.h"
#include "algorithms/options/descriptions.h"
#include "algorithms/options/names.h"
#include "algorithms/spider/brute_force.h"
#include "algorithms/spider/spider.h"
// namespace util {
// template <typename T>
// static auto toMB(T value) {
//     return (std::size_t)(std::abs((double)value)) >> 20;
// }
// template <typename T>
// static auto toGB(T value) {
//     return (std::size_t)(std::abs((double)value)) >> 30;
// }
// template <typename T>
// static auto printGB(T value, bool is_negative) {
//     std::cout << " (" << (is_negative ? "-" : "") << toGB(value) << " gb)";
// }
// template <typename T>
// static auto printMB(T value, bool is_negative) {
//     std::cout << " (" << (is_negative ? "-" : "") << toMB(value) << " mb)";
// }
//
// template <typename T>
// static void PrintSingleOption(std::string const& name, T value) {
//     std::cout << name << ": ";
//     bool is_negative = value < 0;
//     printMB(value, is_negative);
//     printGB(value, is_negative);
//     std::cout << std::endl;
// }
//
// static auto PrintAndGetSysInfo(std::string const& context, bool print) {
//     std::cout << "[" << context << "]" << std::endl;
//     auto info = std::make_unique<struct sysinfo>();
//     sysinfo(info.get());
//     if (print) {
//         PrintSingleOption("freeram", info->freeram);
//         PrintSingleOption("sharedram", info->sharedram);
//         PrintSingleOption("bufferram", info->bufferram);
//         std::cout << std::endl;
//     }
//     return info;
// }
// static void PrintDiff(struct sysinfo* lhs, struct sysinfo* rhs) {
//     PrintSingleOption("freeram", (double)lhs->freeram - rhs->freeram);
//     PrintSingleOption("sharedram", (double)lhs->sharedram - rhs->sharedram);
//     PrintSingleOption("bufferram", (double)lhs->bufferram - rhs->bufferram);
//     std::cout << "\n";
// }
// }  // namespace util

std::vector<std::filesystem::path> GetPathsFromData(std::filesystem::path const& data) {
    if (std::filesystem::is_regular_file(data)) {
        return {data};
    }

    std::vector<std::filesystem::path> paths;
    for (const auto& entry : std::filesystem::directory_iterator(data)) {
        paths.push_back(entry);
    }
    return paths;
}

template <typename T>
static std::unique_ptr<T> Create(std::vector<std::string> const& filenames, algos::IMPL impl,
                                 std::size_t ram_limit, std::size_t mem_check_frequency,char separator = ',',
                                 bool has_header = false) {
    std::cout << "[[" << impl._to_string() << "]]" << std::endl;
    std::vector<std::filesystem::path> paths;
    paths.reserve(filenames.size());
    for (auto const& filename : filenames) {
        auto path{std::filesystem::current_path() / "build" / "target" / "input_data" / filename};
        auto found_files = GetPathsFromData(path);
        paths.insert(paths.end(), found_files.begin(), found_files.end());
    }
    algos::IDAlgorithm::Config conf{.paths = paths,
                                    .separator = separator,
                                    .has_header = has_header,
                                    .ram_limit = ram_limit,
                                    .mem_check_frequency=mem_check_frequency,
                                    .impl = impl};
    auto ptr = std::make_unique<T>(conf);
    ptr->Fit(ptr->getStream());
    return ptr;
}
int main(int argc, char const* argv[]) {
    std::cout << sizeof(std::_Rb_tree_node<unsigned int>) << std::endl;
    std::cout << sizeof(std::_Rb_tree_node<char *>) << std::endl;
    std::cout << sizeof(std::_Rb_tree_node<std::string_view>) << std::endl;
    auto impl{algos::IMPL::VECTORUI};
    if (argc >= 2) {
        impl = algos::IMPL::_from_string_nocase(argv[1]);
    }
    auto ram_memory_limit{8 * (std::size_t)std::pow(2, 30)};
    if (argc >= 3) {
        ram_memory_limit = std::stoull(argv[2]) * (std::size_t)std::pow(2, 30);
    }
    bool has_header = false;
    if (argc >= 4) {
        has_header = std::string{argv[3]} == "true";
    }
    char sep = '|';
    if (argc >= 5) {
        sep = *argv[4];
    }
    std::vector<std::string> files;
    if (argc >= 6) {
        files.insert(files.end(), &argv[5], &argv[argc]);
    } else {
//        files.emplace_back("tpch");
//files.emplace_back("tpc-lnk/lineitem.tbl");
        files.emplace_back("tpc-lnk");
    }
    std::size_t mem_check_frequency = 100000;
//    std::cout << (+impl)._to_string() << " " << ram_memory_limit << " " << has_header << " " << sep << std::endl;
    auto instance = Create<algos::Spider>(files, impl, ram_memory_limit, mem_check_frequency, sep,
                                          has_header);
    instance->Execute();

    return 0;
}
