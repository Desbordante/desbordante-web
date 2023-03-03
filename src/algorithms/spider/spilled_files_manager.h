#pragma once

#include <string>
#include <vector>

class SpilledFilesManager {
    std::filesystem::path temp_dir_;
    // Current offset
    std::size_t cur_offset_ = 0;

    /* i-nth element contains maximum value for i-nth attribute */
    std::vector<std::string> max_values{};
    /* i-nth element contains spill counter for current i-nth attribute
     * (zero if there is no spills for i-nth attribute)
     * */
    std::vector<std::size_t> spill_count{};

    std::size_t GetCurrentColsNumber() const {
        return spill_count.size();
    }

    void Init(std::size_t cols_number) {
        if (spill_count.empty()) {
            max_values.resize(max_values.size() + cols_number);
            spill_count.assign(cols_number, 0);
        } else {
            if (cols_number != spill_count.size()) {
                throw std::runtime_error("not equal");
            }
            assert(cols_number == spill_count.size());
        }
    }
    void Reset() {
        cur_offset_ += GetCurrentColsNumber();
        spill_count.clear();
    }

public:
    explicit SpilledFilesManager(std::filesystem::path const& temp_dir): temp_dir_(temp_dir) {
        if (std::filesystem::exists(temp_dir)) {
            std::filesystem::remove_all(temp_dir);
        }
    }

    std::vector<std::string> GetMaxValues() const {
        return max_values;
    }

    static std::filesystem::path GetResultDirectory(std::optional<std::size_t> spilled_dir = std::nullopt) {
        std::filesystem::path path;
        if (spilled_dir.has_value()) {
            path = GetResultDirectory() / (std::to_string(spilled_dir.value()) + "-column");
        } else {
            path = std::filesystem::current_path() / "temp";
        }
        if (!std::filesystem::exists(path)) {
            std::filesystem::create_directory(path);
        }
        return path;
    }

    static std::filesystem::path GetResultColumnPath(std::size_t id,
                                        std::optional<std::size_t> spilled_file_id = std::nullopt) {
        if (spilled_file_id.has_value()) {
            return GetResultDirectory(id) / std::to_string(spilled_file_id.value());
        } else {
            return GetResultDirectory() / std::to_string(id);
        }
    }

    static std::string MergeSpilledFiles(std::vector<std::ifstream> input, std::ofstream out) {
        using ColumnElement = std::pair<std::string, std::size_t>;
        auto cmp = [](ColumnElement const& lhs, ColumnElement const& rhs) {
            return lhs.first > rhs.first;
        };
        std::priority_queue<ColumnElement, std::vector<ColumnElement>, decltype(cmp)> queue{cmp};
        for (std::size_t i = 0; i < input.size(); ++i) {
            std::string value;
            if (std::getline(input[i], value)) {
                queue.emplace(value, i);
            }
        }
        std::string prev;
        while (!queue.empty()) {
            auto [value, fileIndex] = queue.top();
            queue.pop();
            if (value != prev) {
                out << (prev = value) << std::endl;
            }
            if (std::getline(input[fileIndex], value)) {
                queue.emplace(value, fileIndex);
            }
        }
        return prev;
    }

    void MergeFiles() {
        if (!std::all_of(spill_count.begin(), spill_count.end(), [](auto i) { return i == 0; })) {
            auto merge_time = std::chrono::system_clock::now();

            for (std::size_t i = 0; i != GetCurrentColsNumber(); ++i) {
                if (spill_count[i] == 0) {
                    continue;
                }
                std::vector<std::ifstream> input_files{};
                for (std::size_t j = 0; j != spill_count[i]; ++j) {
                    input_files.emplace_back(GetResultColumnPath(cur_offset_ + i, j));
                }
                max_values[cur_offset_ + i] = MergeSpilledFiles(
                        std::move(input_files), GetResultColumnPath(cur_offset_ + i));
                std::filesystem::remove_all(GetResultDirectory(cur_offset_ + i));
            }

            auto merging_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                    std::chrono::system_clock::now() - merge_time);
            std::cout << "Merging time: " << merging_time.count() << std::endl;
        }
        Reset();
    }

    template <typename It, typename Fn>
    void WriteColumn(Fn const& to_value, bool spill_col, std::size_t attr_id, It begin, It end) {
        auto spilled_file = spill_col ? std::make_optional(spill_count[attr_id]++) : std::nullopt;
        auto path {GetResultColumnPath(cur_offset_ + attr_id, spilled_file)};
        std::ofstream out{path};

        if (!out.is_open()) {
            throw std::runtime_error("Cannot open file" + std::string{path});
        }
        while (begin != end) {
            out << to_value(*(begin++)) << std::endl;
        }
    }
    template <typename Fn, typename T>
    void SpillColumnsToDisk(Fn const& to_value, T& columns, bool is_table_splitted = false) {
        Init(columns.size());
        for (std::size_t attr_id = 0; attr_id != columns.size(); ++attr_id) {
            bool is_column_part = is_table_splitted || spill_count[attr_id] > 0;
            auto& values = columns[attr_id];
            WriteColumn(to_value, is_column_part, attr_id, values.begin(), values.end());
            values.clear();
        }
    }
};
