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

#if defined(__GLIBC__) && defined(__GLIBC_MINOR__)
#define GLIBC_VERSION (__GLIBC__ * 1000 + __GLIBC_MINOR__)
#else
#define GLIBC_VERSION 0
#endif

static std::size_t PAGE_SIZE = sysconf(_SC_PAGE_SIZE);

namespace fs = std::filesystem;

using SetStringView = std::set<std::string_view>;
using PairOffset = std::pair<unsigned int, unsigned int>;
using SetPair = std::set<PairOffset, std::function<bool(const PairOffset&, const PairOffset&)>>;
using VectorStringView = std::vector<std::string_view>;
using VectorPair = std::vector<PairOffset>;

class BaseTableProcessor {
public:
    virtual void Execute() = 0;
    virtual std::size_t GetHeaderSize() const = 0;
    virtual std::vector<std::string> const& GetHeader() const = 0;
    virtual std::vector<std::string> GetMaxValues() const = 0;
    virtual ~BaseTableProcessor() = default;
};

class ChunkGenerator {
public:
    struct Config {
        uintmax_t file_size;
        int fd_;
        std::size_t available_memory;
    };
    using CharPtr = char*;

private:
    Config config_;
    using ChunkData = std::unique_ptr<char, std::function<void(CharPtr)>>;
    ChunkData data_;

    // Specified values
    CharPtr begin_;
    CharPtr end_;

    std::size_t chunk_size_;
    std::size_t specified_chunk_size_;

    std::size_t chunks_n_;
    std::size_t current_chunk_ = 0;

    void SetChunkBorders() {
        begin_ = SpecifyChunkStart(data_.get());
        end_ = SpecifyChunkEnd(data_.get() + specified_chunk_size_);
    }
    CharPtr SpecifyChunkStart(CharPtr data) const {
        if (current_chunk_ == 0) {
            return data;
        }
        while (*(data++) != '\n') {
        }
        return data;
    }

    CharPtr SpecifyChunkEnd(CharPtr data) const {
        if (current_chunk_ == chunks_n_ - 1) {
            return data;
        }
        while (*(--data) != '\n') {
        }
        return data;
    }

public:
    explicit ChunkGenerator(Config config) : config_(config) {
        if (config.fd_ == -1) {
            throw std::runtime_error("Failed to open file.");
        }
        chunks_n_ = std::ceil((double)config_.file_size / (double)config_.available_memory);
        chunk_size_ = (config_.file_size / chunks_n_) & ~(PAGE_SIZE - 1);
        specified_chunk_size_ = std::min(chunk_size_ + PAGE_SIZE, config_.file_size);
        current_chunk_ = -1;
        GetNext();
    }
    bool Splitted() const {
        return chunks_n_ != 1;
    }
    std::size_t ChunksNumber() const {
        return chunks_n_;
    }
    std::size_t ChunkSize() const {
        return chunk_size_;
    }
    std::size_t CurrentChunk() const {
        return current_chunk_;
    }
    std::pair<CharPtr, CharPtr> GetCurrent() {
        return {begin_, end_};
    }
    bool HasNext() const {
        return current_chunk_ != chunks_n_ - 1;
    }
    std::pair<CharPtr, CharPtr> GetNext() {
        if (!HasNext()) {
            throw std::runtime_error("Invalid function call, no more chunks");
        }
        current_chunk_++;
        auto offset = current_chunk_ * chunk_size_;
        if (current_chunk_ == chunks_n_ - 1) {
            specified_chunk_size_ = config_.file_size - offset;
        }
        if (chunks_n_ != 1) {
            std::cout << "Chunk: " << current_chunk_ << '\n';
        }
        data_.reset();
        auto data = (char*)mmap(nullptr, specified_chunk_size_, PROT_READ, MAP_PRIVATE, config_.fd_,
                                (off_t)offset);
        if (data == MAP_FAILED) {
            close(config_.fd_);
            throw std::runtime_error("Failed to mmap file.");
        }
        if (current_chunk_ == 0) {
            data_ = ChunkData(data, [&length = specified_chunk_size_](CharPtr data) {
                munmap(data, length);
            });
        } else {
            data_.reset(data);
        }
        SetChunkBorders();
        return GetCurrent();
    }
};

template <typename T>
class TableProcessor : public BaseTableProcessor {
private:
    using BufferPtr = ChunkGenerator::CharPtr;
    using ColVec = std::vector<T>;

    fs::path const file_path_;
    char separator;
    bool has_header;

    std::size_t swap_count = 0;

    // SET-specific
    std::size_t memory_limit_check_frequency;

    // VECTOR-specific
    std::size_t threads_count_;

    std::size_t attribute_offset;

    uintmax_t file_size_;
    std::size_t memory_limit_;
    std::size_t chunk_m_limit_;
    std::vector<std::string> header_;
    std::vector<std::string> max_values;
    ColVec columns_;
    char escape_symbol_ = '\\';
    char quote_ = '\"';

public:
    TableProcessor(fs::path const& file_path, char separator, bool has_header,
                   std::size_t memory_limit, std::size_t mem_check_frequency,
                   std::size_t threads_count, std::size_t attribute_offset)
        : separator(separator),
          has_header(has_header),
          file_path_(file_path),
          file_size_(fs::file_size(file_path)),
          memory_limit_(memory_limit),
          memory_limit_check_frequency(mem_check_frequency),
          threads_count_(threads_count),
          attribute_offset(attribute_offset) {
        if constexpr (std::is_same_v<T, VectorStringView> || std::is_same_v<T, VectorPair>) {
            chunk_m_limit_ = (double)memory_limit_ / 2;
        } else {
            chunk_m_limit_ = (double)memory_limit_ / 3 * 2;
        }
        if constexpr (std::is_same_v<T, SetPair> || std::is_same_v<T, VectorPair>) {
            chunk_m_limit_ = std::min((double)std::numeric_limits<unsigned int>::max(),
                                      (double)chunk_m_limit_);
        }
    }

    std::size_t HeaderSize() const {
        return header_.size();
    }

    void Execute() override {
        ChunkGenerator chunk_generator_{{.file_size = file_size_,
                                         .fd_ = open(file_path_.c_str(), O_RDONLY),
                                         .available_memory = chunk_m_limit_ }};
        do {
            auto [buffer, end] = chunk_generator_.GetCurrent();
            if (chunk_generator_.CurrentChunk() == 0) {
                if (chunk_generator_.ChunksNumber() != 1) {
                    std::cout << "SPLIT DATASET IN " << chunk_generator_.ChunksNumber() << " CHUNKS"
                              << std::endl;
                }
                buffer = InitHeader(buffer);
                max_values = std::vector(HeaderSize(), std::numeric_limits<std::string>::min());
                ReserveColumns(buffer);
            }
            ProcessColumns(buffer, end, chunk_generator_.CurrentChunk(),
                           chunk_generator_.Splitted());
        } while (chunk_generator_.HasNext());

        std::cout << "ChunkSize: " << chunk_generator_.ChunkSize() << '\n';

        if (chunk_generator_.ChunksNumber() > 1) {
            std::cout << "Merge chunks\n";
            auto merge_time = std::chrono::system_clock::now();

            MergeChunks(chunk_generator_.ChunksNumber());

            auto merging_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                    std::chrono::system_clock::now() - merge_time);
            std::cout << "MergeChunks: " << merging_time.count() << std::endl;
        }
    }

    void To(std::size_t value, std::string const& to = "mb") {
        if (to == "kb") {
            std::cout << (value >> 10);
        } else if (to == "mb") {
            std::cout << (value >> 20);
        } else if (to == "gb") {
            std::cout << (value >> 30);
        } else {
            std::cout << "unexpected ";
        }
        std::cout << " " << to << std::endl;
    }

    std::size_t CalculateRowsLimit(std::size_t rows_number) {
        std::size_t row_memory = HeaderSize() * sizeof(typename T::value_type);
        std::size_t needed_memory = rows_number * row_memory;
        std::size_t data_memory_limit = memory_limit_ - chunk_m_limit_;

        std::size_t rows_limit;
        if (needed_memory > data_memory_limit) {
            std::size_t times = std::ceil((double)needed_memory / (double)data_memory_limit);
            rows_limit = std::ceil((double)rows_number / (double)times);
            std::cout << (needed_memory >> 20) << " > " << (data_memory_limit >> 20) << " [" << times
                      << "]\n";
        } else {
            rows_limit = rows_number;
        }
        return rows_limit;
    }

    void ReserveColumns(BufferPtr buffer) {
        if constexpr (std::is_same_v<T, VectorStringView> || std::is_same_v<T, SetStringView> ||
                      std::is_same_v<T, VectorPair>) {
            columns_.assign(HeaderSize(), {});
        } else if constexpr (std::is_same_v<T, SetPair>) {
            auto cmp = [buffer](const std::pair<size_t, size_t>& a,
                                const std::pair<size_t, size_t>& b) {
                int cmp = std::memcmp(buffer + a.first, buffer + b.first,
                                      std::min(a.second, b.second));
                if (cmp == 0) {
                    return a.second < b.second;
                }
                return cmp < 0;
            };
            columns_ = std::vector(HeaderSize(), T{cmp});
        } else {
            throw std::runtime_error("err");
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

    static fs::path GenerateDirectory(std::size_t swap_count, std::size_t chunk_count,
                                      bool splitted = false) {
        fs::path dir = fs::current_path();
        if (splitted) {
            dir /= "temp" + std::to_string(chunk_count);
        } else {
            dir /= "temp";
        }
        if (swap_count != 0) {
            if (!fs::exists(dir)) {
                fs::create_directory(dir);
            }
            dir /= "swap" + std::to_string(swap_count);
        }
        if (!fs::exists(dir)) {
            fs::create_directory(dir);
        }
        return dir;
    }

    static fs::path GeneratePath(std::size_t index, std::size_t swap_count = 0,
                                 std::size_t chunk_count = 0, bool splitted = false) {
        return GenerateDirectory(swap_count, chunk_count, splitted) / std::to_string(index);
    }

    void PrintCurrentSizeInfo(std::string const& context = "") {
        if (!context.empty()) {
            std::cout << context << std::endl;
        }
        assert(columns_.size() == HeaderSize());
        for (std::size_t i = 0; i != HeaderSize(); ++i) {
            std::cout << header_[i] << "-" << columns_[i].size() << " | ";
        }
        std::cout << std::endl;
    }

    void WriteAllColumns(BufferPtr buffer, bool is_final, std::size_t cur_chunk, bool splitted) {
        Sort(buffer);

        auto write_time = std::chrono::system_clock::now();

        if (!is_final || swap_count != 0) {
            swap_count++;
        }
        for (std::size_t i = 0; i != columns_.size(); ++i) {
            auto path = GeneratePath(i + attribute_offset, swap_count, cur_chunk, splitted);
            WriteColumn(buffer, i, path, is_final);
        }
        std::cout << "Memory: " << (GetCurrentMemory() >> 20) << std::endl;

        for (auto& values : columns_) {
            values.clear();
        }
        if (is_final && swap_count != 0) {
            std::cout << "Merge files\n";
            for (std::size_t i = 0; i != HeaderSize(); ++i) {
                MergeAndRemoveDuplicates(i, cur_chunk, splitted);
            }
            for (std::size_t i = 0; i != HeaderSize(); ++i) {
                auto dir = GenerateDirectory(i + 1, cur_chunk, splitted);
                if (fs::remove_all(dir) <= 0) {
                    std::cout << "Error deleting directory: " << dir << std::endl;
                }
            }
        }
        auto writing_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - write_time);
        std::cout << "Writing: " << writing_time.count() << std::endl;
    }

    void MergeAndRemoveDuplicates(std::vector<std::ifstream> inputFiles, std::ofstream outputFile,
                                  std::size_t attr_id) {
        using ColumnElement = std::pair<std::string, std::size_t>;
        auto cmp = [](ColumnElement const& lhs, ColumnElement const& rhs) {
            return lhs.first > rhs.first;
        };
        std::priority_queue<ColumnElement, std::vector<ColumnElement>, decltype(cmp)> queue{cmp};
        for (std::size_t i = 0; i < inputFiles.size(); ++i) {
            std::string value;
            if (std::getline(inputFiles[i], value)) {
                queue.emplace(value, i);
            }
        }
        std::string prev;
        while (!queue.empty()) {
            auto [value, fileIndex] = queue.top();
            queue.pop();

            if (value != prev) {
                outputFile << value << std::endl;
                prev = value;
            }

            if (std::getline(inputFiles[fileIndex], value)) {
                queue.emplace(value, fileIndex);
            }
        }
        max_values[attr_id] = prev;
    }

    void MergeAndRemoveDuplicates(std::size_t attr_id, std::size_t cur_chunk, bool splitted) {
        // Open all the input files
        std::vector<std::ifstream> inputFiles;
        for (std::size_t i = 0; i < swap_count; ++i) {
            inputFiles.emplace_back(
                    GeneratePath(attr_id + attribute_offset, i + 1, cur_chunk, splitted));
        }
        // Open the output file
        std::ofstream outputFile(GeneratePath(attr_id + attribute_offset, 0, cur_chunk, splitted));
        MergeAndRemoveDuplicates(std::move(inputFiles), std::move(outputFile), attr_id);
    }

    void MergeChunks(std::size_t chunks_n) {
        for (std::size_t i = 0; i != HeaderSize(); ++i) {
            MergeChunk(i, chunks_n);
        }
        for (std::size_t i = 0; i != chunks_n; ++i) {
            auto dir = GenerateDirectory(0, i, chunks_n != 1);
            if (fs::remove_all(dir) <= 0) {
                std::cout << "Error deleting directory: " << dir << std::endl;
            }
        }
    }

    void MergeChunk(std::size_t attr_id, std::size_t chunks_n) {
        std::vector<std::ifstream> inputFiles;
        for (std::size_t i = 0; i < chunks_n; ++i) {
            inputFiles.emplace_back(GeneratePath(attr_id + attribute_offset, 0, i, chunks_n != 1));
        }
        std::ofstream outputFile(GeneratePath(attr_id + attribute_offset));
        MergeAndRemoveDuplicates(std::move(inputFiles), std::move(outputFile), attr_id);
    }

    void WriteColumn(BufferPtr buffer, std::size_t i, std::filesystem::path const& path,
                     bool is_final) {
        std::ofstream out{path};
        if (!out.is_open()) {
            throw std::runtime_error("cannot open");
        }
        auto& values = columns_[i];
        for (auto const& value : values) {
            if constexpr (std::is_same_v<SetStringView, T> || std::is_same_v<VectorStringView, T>) {
                out << value;
            } else if constexpr (std::is_same_v<VectorPair, T> || std::is_same_v<SetPair, T>) {
                auto [begin, size] = value;
                auto val_ptr = buffer + begin;
                out << std::string_view{val_ptr, size};
            }
            out << std::endl;
        }

        if (is_final) {
            auto getValue = [this, i]() {
                if constexpr (std::is_same_v<SetStringView, T> || std::is_same_v<SetPair, T>) {
                    return *(--columns_[i].end());
                } else {
                    return columns_[i].back();
                }
            };

            if (!columns_[i].empty()) {
                if constexpr (std::is_same_v<SetStringView, T> ||
                              std::is_same_v<VectorStringView, T>) {
                    max_values[i] = std::string{getValue()};
                } else if constexpr (std::is_same_v<SetPair, T> || std::is_same_v<VectorPair, T>) {
                    auto [begin, size] = getValue();
                    auto val_ptr = buffer + begin;
                    max_values[i] = std::string{std::string_view{val_ptr, size}};
                }
            }
        }
    }

    std::size_t GetRowsNumber(BufferPtr buffer, BufferPtr buffer_end) const {
        auto count_time = std::chrono::system_clock::now();
        std::size_t rows_count = std::count(buffer, buffer_end, '\n');

        auto counting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - count_time);

        std::cout << "Counting time: " << counting_time.count() << std::endl;

        return rows_count;
    }

    void ProcessColumns(BufferPtr buffer, BufferPtr buffer_end,
                        std::size_t cur_chunk,
                        bool splitted) {
        std::size_t rows_limit = 0, chunk_lines_count = 0;
        if constexpr (std::is_same_v<T, VectorStringView> || std::is_same_v<VectorPair, T>) {
            chunk_lines_count = GetRowsNumber(buffer, buffer_end);
            rows_limit = CalculateRowsLimit(chunk_lines_count);
            for (auto& col : columns_) {
                col.reserve(rows_limit);
            }
        }
        auto insert_time = std::chrono::system_clock::now();

        std::size_t length = buffer_end - buffer;
        auto line_begin = buffer, next_pos = line_begin;
        auto line_end = (char*)memchr(line_begin, '\n', length);
        using escaped_list_t = boost::escaped_list_separator<char>;
        escaped_list_t escaped_list(escape_symbol_, separator, quote_);
        std::size_t cur_index;

        std::size_t counter = 0;
        while (line_end != nullptr && line_end < buffer_end) {
            if constexpr (std::is_same_v<VectorStringView, T> || std::is_same_v<VectorPair, T>) {
                counter++;
                if (chunk_lines_count != rows_limit && counter == rows_limit) {
                    counter = 0;
                    std::cout << "SWAP " << swap_count << std::endl;
                    WriteAllColumns(buffer, false, cur_chunk, splitted);
                    std::cout << "SWAPPED" << std::endl;
                }
            } else {
                if (++counter == memory_limit_check_frequency) {
                    counter = 0;
                    if (IsMemoryLimitReached()) {
                        WriteAllColumns(buffer, false, cur_chunk, splitted);
                    }
                }
            }
            boost::tokenizer<escaped_list_t, char const*> tokens(line_begin, line_end,
                                                                 escaped_list);
            for (std::string const& value : tokens) {
                if (!value.empty()) {
                    bool is_quoted = (*next_pos == '\"' && *(next_pos + value.size() + 1) == '\"');
                    if (is_quoted) {
                        next_pos++;
                    }
                    if constexpr (std::is_same_v<T, VectorStringView>) {
                        columns_[cur_index].emplace_back(next_pos, value.size());
                    } else if constexpr (std::is_same_v<T, SetStringView>) {
                        columns_[cur_index].insert(std::string_view(next_pos, value.size()));
                    } else if constexpr (std::is_same_v<T, VectorPair>) {
                        columns_[cur_index].emplace_back(next_pos - buffer, value.size());
                    } else if constexpr (std::is_same_v<T, SetPair>) {
                        columns_[cur_index].emplace(next_pos - buffer, value.size());
                    } else {
                        throw std::runtime_error("wht3");
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
        WriteAllColumns(buffer, true, cur_chunk, splitted);
    }
    void Sort(BufferPtr buffer) {
        if constexpr (std::is_same_v<T, VectorStringView> || std::is_same_v<T, VectorPair>) {
            auto sort_time = std::chrono::system_clock::now();
            std::vector<std::thread> threads;
            for (std::size_t j = 0; j < HeaderSize(); ++j) {
                threads.emplace_back(std::thread{[this, j, buffer]() {
                    if constexpr (std::is_same_v<T, VectorStringView>) {
                        std::sort(columns_[j].begin(), columns_[j].end());
                        columns_[j].erase(unique(columns_[j].begin(), columns_[j].end()),
                                          columns_[j].end());
                    } else if (std::is_same_v<T, VectorPair>) {
                        std::sort(columns_[j].begin(), columns_[j].end(),
                                  [buffer](const PairOffset& lhs, const PairOffset& rhs) {
                                      size_t len1 = lhs.second, len2 = rhs.second;
                                      int cmp = std::memcmp(buffer + lhs.first, buffer + rhs.first,
                                                            std::min(len1, len2));
                                      return (cmp == 0 && len1 < len2) || cmp < 0;
                                  });
                        columns_[j].erase(
                                unique(columns_[j].begin(), columns_[j].end(),
                                       [buffer](const PairOffset& lhs, const PairOffset& rhs) {
                                           if (lhs.second != rhs.second) {
                                               return false;
                                           }
                                           return std::memcmp(buffer + lhs.first,
                                                              buffer + rhs.first, lhs.second) == 0;
                                       }),
                                columns_[j].end());
                    }
                }});
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
    }

    auto GetCurrentMemory() const {
        if constexpr (std::is_same_v<SetStringView, T> || std::is_same_v<SetPair, T>) {
#if GLIBC_VERSION >= 2033
            return mallinfo2().uordblks;
#else
            double magic_number = 200.0 / 167;
            std::size_t rough_estimation = sizeof(T);
            for (auto const& column : columns_) {
                rough_estimation +=
                        column.size() * sizeof(std::_Rb_tree_node<typename T::key_type>);
            }
            return (std::size_t)(magic_number * (double)rough_estimation);
#endif
        } else {
            std::size_t row_memory = HeaderSize() * sizeof(typename T::value_type);
            return row_memory * columns_.front().capacity();
        }
    }

    bool IsMemoryLimitReached() const {
        return GetCurrentMemory() > (memory_limit_ - chunk_m_limit_);
    }

    ~TableProcessor() override = default;

    std::size_t GetHeaderSize() const override {
        return header_.size();
    }
    std::vector<std::string> const& GetHeader() const override {
        return header_;
    }
    std::vector<std::string> GetMaxValues() const override {
        return max_values;
    }
};