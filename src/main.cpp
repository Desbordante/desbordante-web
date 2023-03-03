#include <cstring>
#include <filesystem>
#include <iostream>
#include <string>
#include <vector>

#include "algorithms/create_primitive.h"
#include "algorithms/spider/spider.h"

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

//template <typename T>
//static std::unique_ptr<T> Create(std::vector<std::string> const& filenames, ColType data,
//                                 KeyType key,
//                                 std::size_t ram_limit, std::size_t mem_check_frequency,
//                                 std::size_t threads, char separator = ',',
//                                 bool has_header = false) {
//    std::cout << "[[" << data._to_string() << " " << key._to_string() << "]]" << std::endl;
//    std::vector<std::filesystem::path> paths;
//    paths.reserve(filenames.size());
//    for (auto const& filename : filenames) {
//        auto path{std::filesystem::current_path() / "build" / "target" / "input_data" / filename};
//        auto found_files = GetPathsFromData(path);
//        paths.insert(paths.end(), found_files.begin(), found_files.end());
//    }
//    algos::IDAlgorithm::Config conf{.paths = paths,
//                                    .separator = separator,
//                                    .has_header = has_header,
//                                    .ram_limit = ram_limit,
//                                    .mem_check_frequency = mem_check_frequency,
//                                    .threads_count = threads,
//                                    .col_type=data,
//                                    .key_type=key};
//    auto ptr = std::make_unique<T>(conf);
//    ptr->Fit(ptr->getStream());
//    return ptr;
//}
int main(int argc, char const* argv[]) {
    auto data{ColType::VECTOR};
    int cur_arg = 2;
    auto get_cur_arg = [&cur_arg, &argv]() -> const char*& { return argv[cur_arg++ - 1]; };
    if (argc >= cur_arg) {
        data = ColType::_from_string_nocase(get_cur_arg());
    }
    auto key{KeyType::STRING_VIEW};
    if (argc >= cur_arg) {
        key = KeyType::_from_string_nocase(get_cur_arg());
    }
    auto ram_memory_limit{8 * (std::size_t)std::pow(2, 30)};
    if (argc >= cur_arg) {
        ram_memory_limit = std::stoull(get_cur_arg()) * (std::size_t)std::pow(2, 30);
    }
    std::size_t threads = 8;
    if (argc >= cur_arg) {
        threads = std::stoull(get_cur_arg());
    }
    std::size_t mem_check_frequency = 100000;
    if (argc >= cur_arg) {
        mem_check_frequency = std::stoull(get_cur_arg());
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
//    auto instance = Create<algos::Spider>(files, data, key, ram_memory_limit, mem_check_frequency,
//                                          threads, sep, has_header);
//    instance->Execute();

    return 0;
}
