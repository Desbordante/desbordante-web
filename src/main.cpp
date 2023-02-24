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
                                 std::size_t ram_limit, std::size_t mem_check_frequency,
                                 std::size_t threads, char separator = ',',
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
                                    .mem_check_frequency = mem_check_frequency,
                                    .threads_count = threads,
                                    .impl = impl};
    auto ptr = std::make_unique<T>(conf);
    ptr->Fit(ptr->getStream());
    return ptr;
}
int main(int argc, char const* argv[]) {
    auto impl{algos::IMPL::VECTORUI};
    int cur_arg = 2;
    auto get_cur_arg = [&cur_arg, &argv]() -> const char*& { return argv[cur_arg++ - 1]; };
    if (argc >= cur_arg) {
        impl = algos::IMPL::_from_string_nocase(get_cur_arg());
    }
    auto ram_memory_limit{8 * (std::size_t)std::pow(2, 30)};
    if (argc >= cur_arg) {
        ram_memory_limit = std::stoull(get_cur_arg()) * (std::size_t)std::pow(2, 30);
    }
    std::size_t threads = 8;
    if (argc >= cur_arg) {
        threads = std::stoull(get_cur_arg());
    }
    bool has_header = false;
    if (argc >= cur_arg) {
        has_header = std::string{get_cur_arg()} == "true";
    }
    char sep = '|';
    if (argc >= cur_arg) {
        sep = *get_cur_arg();
    }
    std::vector<std::string> files;
    if (argc >= cur_arg) {
        files.insert(files.end(), &get_cur_arg(), &argv[argc]);
    } else {
        files.emplace_back("tpc-lnk");
    }
    std::size_t mem_check_frequency = 100000;
    auto instance = Create<algos::Spider>(files, impl, ram_memory_limit, mem_check_frequency,
                                          threads, sep, has_header);
    instance->Execute();

    return 0;
}
