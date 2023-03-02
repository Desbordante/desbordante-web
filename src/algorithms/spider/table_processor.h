#pragma once

#include <algorithm>
#include <cmath>
#include <cstring>
#include <fcntl.h>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <malloc.h>
#include <optional>
#include <queue>
#include <set>
#include <stdexcept>
#include <string>
#include <string_view>
#include <sys/mman.h>
#include <thread>
#include <unistd.h>
#include <vector>

#include <boost/range/iterator_range.hpp>
#include <boost/tokenizer.hpp>

#ifndef BETTER_ENUMS_CONSTEXPR_TO_STRING
#define BETTER_ENUMS_CONSTEXPR_TO_STRING
#endif

#include <enum.h>

#include "chunk_generator.h"

#if defined(__GLIBC__) && defined(__GLIBC_MINOR__)
#define GLIBC_VERSION (__GLIBC__ * 1000 + __GLIBC_MINOR__)
#else
#define GLIBC_VERSION 0
#endif

namespace fs = std::filesystem;

using PairOffset = std::pair<unsigned int, unsigned int>;

BETTER_ENUM(KeyType, char, STRING_VIEW, UINT_PAIR)
using KeysTuple = std::tuple<std::string_view, PairOffset>;
using SetTypes =
        std::tuple<std::set<std::string_view>,
                   std::set<PairOffset, std::function<bool(PairOffset const&, PairOffset const&)>>>;

class BaseTableProcessor {
protected:
    fs::path const file_path_;
    char separator;
    bool has_header;

    std::size_t attr_offset_;

    uintmax_t file_size_;
    std::size_t memory_limit_;
    std::size_t chunk_m_limit_;

    std::vector<std::string> header_;
    // i-nth element contains maximum value for i-nth attribute
    std::vector<std::string> max_values;
    // i-nth element contains counter for i-nth attribute
    std::vector<std::size_t> spill_count;
    using BufferPtr = ChunkGenerator::CharPtr;

public:
    virtual ~BaseTableProcessor() = default;

    static fs::path GetResultDirectory(std::optional<std::size_t> id = std::nullopt) {
        fs::path path;
        if (id.has_value()) {
            path = GetResultDirectory() / (std::to_string(id.value()) + "-column");
        } else {
            path = std::filesystem::current_path() / "temp";
        }
        if (!fs::exists(path)) {
            fs::create_directory(path);
        }
        return path;
    }

    static fs::path GetResultColumnPath(std::size_t id,
                                        std::optional<std::size_t> spilled_file = std::nullopt) {
        if (spilled_file.has_value()) {
            return GetResultDirectory(id) / std::to_string(spilled_file.value());
        } else {
            return GetResultDirectory() / std::to_string(id);
        }
    }
    BaseTableProcessor(fs::path const& file_path, char separator, bool has_header,
                       std::size_t memory_limit, std::size_t attribute_offset,
                       std::size_t chunk_m_limit)
        : file_path_(file_path),
          separator(separator),
          has_header(has_header),
          attr_offset_(attribute_offset),
          file_size_(fs::file_size(file_path)),
          memory_limit_(memory_limit),
          chunk_m_limit_(chunk_m_limit) {}

    std::size_t HeaderSize() const {
        return header_.size();
    }
    std::vector<std::string> const& GetHeader() const {
        return header_;
    }
    std::vector<std::string> GetMaxValues() const {
        return max_values;
    }

    virtual void ReserveColumns(BufferPtr) = 0;
    virtual void ProcessColumns(BufferPtr buffer, BufferPtr buffer_end, bool is_chunk) = 0;

    void Execute() {
        ChunkGenerator chunk_generator_{{.file_size = file_size_,
                                         .fd_ = open(file_path_.c_str(), O_RDONLY),
                                         .memory_limit = chunk_m_limit_}};
        while (chunk_generator_.HasNext()) {
            auto [buffer, end] = chunk_generator_.GetNext();
            if (chunk_generator_.CurrentChunk() == 0) {
                buffer = InitHeader(buffer);
                max_values.assign(HeaderSize(), std::numeric_limits<std::string>::min());
                spill_count.assign(HeaderSize(), 0);
            }
            ReserveColumns(buffer);
            ProcessColumns(buffer, end, chunk_generator_.Splitted());
        };

        MergeFiles();
    }
    void MergeFiles() {
        if (!std::all_of(spill_count.begin(), spill_count.end(), [](auto i) { return i == 0; })) {
            auto merge_time = std::chrono::system_clock::now();

            for (std::size_t i = 0; i != HeaderSize(); ++i) {
                if (spill_count[i] == 0) {
                    continue;
                }
                std::vector<std::ifstream> input_files{};
                for (std::size_t j = 0; j != spill_count[i]; ++j) {
                    input_files.emplace_back(GetResultColumnPath(attr_offset_ + i, j));
                }
                max_values[i] = MergeSpilledFiles(std::move(input_files),
                                                  GetResultColumnPath(attr_offset_ + i));
            }

            auto merging_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                    std::chrono::system_clock::now() - merge_time);
            std::cout << "Merging time: " << merging_time.count() << std::endl;
        }
    }

    BufferPtr InitHeader(BufferPtr buffer) {
        char const* pos = buffer;
        while (*pos != '\0' && *pos != '\n') {
            char const* next_pos = pos;
            while (*next_pos != '\0' && *next_pos != separator && *next_pos != '\n') {
                next_pos++;
            }
            if (has_header) {
                header_.emplace_back(pos, next_pos - pos);
            } else {
                header_.emplace_back(std::to_string(HeaderSize()));
            }
            pos = next_pos + (*next_pos == separator);
        }
        if (has_header) {
            buffer = (BufferPtr)pos;
        }
        return has_header ? (BufferPtr)pos : buffer;
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

    template <typename Fn, typename It>
    void WriteColumn(bool is_chunk, std::size_t attr_id, It begin, It end, Fn transformer) {
        auto spilled_file = is_chunk ? std::make_optional(spill_count[attr_id]++) : std::nullopt;
        fs::path path = GetResultColumnPath(attr_offset_ + attr_id, spilled_file);
        std::ofstream out{path};

        if (!out.is_open()) {
            throw std::runtime_error("Cannot open file" + std::string{path});
        }
        while (begin != end) {
            out << transformer(*(begin++)) << std::endl;
        }
    }

    template <typename SerializerFn, typename C>
    void SpillToDisk(SerializerFn const& fn, C const& columns_getter, bool is_part = false) {
        auto columns = columns_getter();
        for (std::size_t attr_id = 0; attr_id != HeaderSize(); ++attr_id) {
            auto& values = columns[attr_id];
            WriteColumn(is_part, attr_id, values.begin(), values.end(), fn);
            values.clear();
        }
    }

    template <typename SerializerFn, typename C>
    void MemoryLimitProcess(SerializerFn const& fn, C const& columns_getter,
                            const std::function<bool()>& is_limit_reached) {
        if (is_limit_reached()) {
            std::cout << "memory limit\n";
            SpillToDisk(fn, columns_getter, true);
        }
    }
};

template <KeyType key>
class SetBasedTableProcessor : public BaseTableProcessor {
private:
    using BufferPtr = ChunkGenerator::CharPtr;
    using ValueType = std::tuple_element_t<key, KeysTuple>;
    using T = std::tuple_element_t<key, SetTypes>;
    using ColVec = std::vector<T>;

    std::size_t memory_limit_check_frequency;
    ColVec columns_;

public:
    SetBasedTableProcessor(fs::path const& file_path, char separator, bool has_header,
                           std::size_t memory_limit, std::size_t attribute_offset,
                           std::size_t mem_check_frequency)
        : BaseTableProcessor(file_path, separator, has_header, memory_limit, attribute_offset,
                             memory_limit / 3 * 2),
          memory_limit_check_frequency(mem_check_frequency) {
        if constexpr (std::is_same_v<ValueType, PairOffset>) {
            chunk_m_limit_ = std::min((double)std::numeric_limits<unsigned int>::max(),
                                      (double)chunk_m_limit_);
        }
    }

    void ReserveColumns(BufferPtr buffer) override {
        if constexpr (std::is_same_v<ValueType, std::string_view>) {
            columns_.assign(HeaderSize(), {});
        } else if constexpr (std::is_same_v<ValueType, PairOffset>) {
            auto cmp = [buffer](const PairOffset& lhs, const PairOffset& rhs) {
                int cmp = std::memcmp(buffer + lhs.first, buffer + rhs.first,
                                      std::min(lhs.second, rhs.second));
                return (cmp == 0 && lhs.second < rhs.second) || cmp < 0;
            };
            columns_ = std::vector(HeaderSize(), T{cmp});
        }
    }

    void ProcessColumns(BufferPtr buffer, BufferPtr buffer_end, bool is_chunk) override {
        auto insert_time = std::chrono::system_clock::now();

        auto serializer = [buffer]() {
            if constexpr (std::is_same_v<std::string_view, ValueType>) {
                return [](ValueType const& value) { return value; };
            } else {
                return [buffer](ValueType const& value) {
                    auto [begin, size] = value;
                    auto val_ptr = buffer + begin;
                    return std::string_view{val_ptr, size};
                };
            };
        };
        auto serializer_fn = serializer();

        std::size_t length = buffer_end - buffer;
        auto line_begin = buffer, next_pos = line_begin;
        auto line_end = (char*)memchr(line_begin, '\n', length);
        using escaped_list_t = boost::escaped_list_separator<char>;

        char escape_symbol = '\\';
        char quote = '\"';
        escaped_list_t escaped_list(escape_symbol, separator, quote);
        std::size_t cur_index;

        auto get_columns = [&]() -> ColVec& { return columns_; };
        std::size_t current_row = 0;
        while (line_end != nullptr && line_end < buffer_end) {
            if (++current_row == memory_limit_check_frequency) {
                auto is_ml_reached = [&]() {
                    return GetCurrentMemory() > (memory_limit_ - chunk_m_limit_);
                };
                MemoryLimitProcess(serializer_fn, get_columns, is_ml_reached);
            }
            boost::tokenizer<escaped_list_t, char const*> tokens(line_begin, line_end,
                                                                 escaped_list);
            for (std::string const& value : tokens) {
                if (!value.empty()) {
                    bool is_quoted = (*next_pos == '\"' && *(next_pos + value.size() + 1) == '\"');
                    if (is_quoted) {
                        next_pos++;
                    }
                    if constexpr (std::is_same_v<ValueType, std::string_view>) {
                        columns_[cur_index].emplace(next_pos, value.size());
                    } else if constexpr (std::is_same_v<ValueType, PairOffset>) {
                        columns_[cur_index].emplace(next_pos - buffer, value.size());
                    }
                    if (is_quoted) {
                        next_pos++;
                    }
                    next_pos += value.size();
                }
                next_pos++;
                cur_index++;
            }
            cur_index = 0;

            line_begin = line_end + 1;
            next_pos = line_begin;
            length = buffer_end - line_begin;
            line_end = (char*)memchr(line_begin, '\n', length);
        }
        auto inserting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - insert_time);
        std::cout << "Inserting: " << inserting_time.count() << std::endl;
        SpillToDisk(serializer_fn, get_columns, is_chunk);
    }

    auto GetCurrentMemory() const {
#if GLIBC_VERSION >= 2033
        return mallinfo2().uordblks;
#else
        double magic_number = 200.0 / 167;
        std::size_t rough_estimation = sizeof(T);
        for (auto const& column : columns_) {
            rough_estimation += column.size() * sizeof(std::_Rb_tree_node<typename T::key_type>);
        }
        return (std::size_t)(magic_number * (double)rough_estimation);
#endif
    }

    ~SetBasedTableProcessor() override = default;
};

template <KeyType key>
class VectorTableProcessor : public BaseTableProcessor {
private:
    using ValueType = std::tuple_element_t<key, KeysTuple>;
    using T = std::vector<ValueType>;
    using ColVec = std::vector<T>;

    std::size_t threads_count_;
    ColVec columns_;

public:
    VectorTableProcessor(fs::path const& file_path, char separator, bool has_header,
                         std::size_t memory_limit, std::size_t attribute_offset,
                         std::size_t threads_count)
        : BaseTableProcessor(file_path, separator, has_header, memory_limit, attribute_offset,
                             memory_limit / 2),
          threads_count_(threads_count) {
        chunk_m_limit_ =
                std::min((double)std::numeric_limits<unsigned int>::max(), (double)chunk_m_limit_);
    }

    void ReserveColumns(BufferPtr) override {
        columns_.assign(HeaderSize(), {});
    }

    std::size_t CalculateRowsLimit(std::size_t rows_number) {
        std::size_t row_memory = HeaderSize() * sizeof(typename T::value_type);
        std::size_t needed_memory = rows_number * row_memory;
        std::size_t data_memory_limit = memory_limit_ - chunk_m_limit_;

        std::size_t rows_limit;
        if (needed_memory > data_memory_limit) {
            std::size_t times = std::ceil((double)needed_memory / (double)data_memory_limit);
            rows_limit = std::ceil((double)rows_number / (double)times);
            std::cout << (needed_memory >> 20) << " > " << (data_memory_limit >> 20) << " ["
                      << times << "]\n";
        } else {
            rows_limit = rows_number;
        }
        return rows_limit;
    }

    std::size_t GetRowsNumber(BufferPtr buffer, BufferPtr buffer_end) const {
        auto count_time = std::chrono::system_clock::now();
        std::size_t rows_count = std::count(buffer, buffer_end, '\n');

        auto counting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - count_time);

        std::cout << "Counting time: " << counting_time.count() << std::endl;

        return rows_count;
    }


    void ProcessColumns(BufferPtr buffer, BufferPtr buffer_end, bool is_chunk) override {
        std::size_t chunk_lines_count = GetRowsNumber(buffer, buffer_end);
        std::size_t rows_limit = CalculateRowsLimit(chunk_lines_count);
        auto serializer = [buffer]() {
            if constexpr (std::is_same_v<std::string_view, ValueType>) {
                return [](ValueType const& value) { return value; };
            } else {
                return [buffer](ValueType const& value) {
                    auto [begin, size] = value;
                    auto val_ptr = buffer + begin;
                    return std::string_view{val_ptr, size};
                };
            };
        };
        auto serializer_fn = serializer();
        for (auto& col : columns_) {
            col.reserve(rows_limit);
        }
        auto insert_time = std::chrono::system_clock::now();

        std::size_t length = buffer_end - buffer;
        auto line_begin = buffer, next_pos = line_begin;
        auto line_end = (char*)memchr(line_begin, '\n', length);
        using escaped_list_t = boost::escaped_list_separator<char>;
        char escape_symbol = '\\';
        char quote = '\"';
        escaped_list_t escaped_list(escape_symbol, separator, quote);
        std::size_t cur_index;
        auto sort_and_dedup = [&]() -> ColVec& {
            Sort(buffer);
            return columns_;
        };
        std::size_t counter = 0;
        while (line_end != nullptr && line_end < buffer_end) {
            counter++;
            auto is_limit_reached = [chunk_lines_count, rows_limit, counter]() {
                return chunk_lines_count != rows_limit && counter % rows_limit == 0;
            };
            MemoryLimitProcess(serializer_fn, sort_and_dedup, is_limit_reached);
            boost::tokenizer<escaped_list_t, char const*> tokens(line_begin, line_end,
                                                                 escaped_list);
            for (std::string const& value : tokens) {
                if (!value.empty()) {
                    bool is_quoted = (*next_pos == '\"' && *(next_pos + value.size() + 1) == '\"');
                    if (is_quoted) {
                        next_pos++;
                    }
                    if constexpr (std::is_same_v<ValueType, std::string_view>) {
                        columns_[cur_index].emplace_back(next_pos, value.size());
                    } else if constexpr (std::is_same_v<ValueType, PairOffset>) {
                        columns_[cur_index].emplace_back(next_pos - buffer, value.size());
                    }
                    if (is_quoted) {
                        next_pos++;
                    }
                    next_pos += value.size();
                }
                next_pos++;
                cur_index++;
            }
            cur_index = 0;

            line_begin = line_end + 1;
            next_pos = line_begin;
            length = buffer_end - line_begin;
            line_end = (char*)memchr(line_begin, '\n', length);
        }
        auto inserting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - insert_time);
        std::cout << "Inserting: " << inserting_time.count() << std::endl;
        SpillToDisk(serializer_fn, sort_and_dedup, is_chunk);
    }
    void Sort(BufferPtr buffer) {
        auto sort_time = std::chrono::system_clock::now();
        std::vector<std::thread> threads;
        for (std::size_t j = 0; j < HeaderSize(); ++j) {
            threads.emplace_back([&col = columns_[j], buffer]() {
                if constexpr (std::is_same_v<ValueType, std::string_view>) {
                    std::sort(col.begin(), col.end());
                    col.erase(unique(col.begin(), col.end()), col.end());
                } else if (std::is_same_v<ValueType, PairOffset>) {
                    std::sort(col.begin(), col.end(), [buffer](const auto& lhs, const auto& rhs) {
                        size_t len1 = lhs.second, len2 = rhs.second;
                        int cmp = std::memcmp(buffer + lhs.first, buffer + rhs.first,
                                              std::min(len1, len2));
                        return (cmp == 0 && len1 < len2) || cmp < 0;
                    });
                    auto equal_cmp = [buffer](const auto& lhs, const auto& rhs) {
                        if (lhs.second != rhs.second) {
                            return false;
                        }
                        return std::memcmp(buffer + lhs.first, buffer + rhs.first, lhs.second) == 0;
                    };
                    col.erase(unique(col.begin(), col.end(), equal_cmp), col.end());
                }
            });
            if ((j != 0 && j % threads_count_ == 0) || j == HeaderSize() - 1) {
                for (auto& th : threads) {
                    th.join();
                }
                threads.clear();
            }
        }
        auto sorting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - sort_time);
        std::cout << "Sorting: " << sorting_time.count() << std::endl;
    }

    auto GetCurrentMemory() const {
        std::size_t row_memory = HeaderSize() * sizeof(typename T::value_type);
        return row_memory * columns_.front().capacity();
    }
    ~VectorTableProcessor() override = default;
};