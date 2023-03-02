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

namespace fs = std::filesystem;

class ChunkGenerator {
public:
    struct Config {
        uintmax_t file_size;
        int fd_;
        std::size_t memory_limit;
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
    std::size_t current_chunk_;

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
    explicit ChunkGenerator(Config config) : config_(config), begin_(nullptr), end_(nullptr) {
        if (config.fd_ == -1) {
            throw std::runtime_error("Failed to open file.");
        }
        chunks_n_ = std::ceil((double)config_.file_size / (double)config_.memory_limit);
//        chunks_n_ = std::max((std::size_t)2, chunks_n_);
        chunk_size_ = (config_.file_size / chunks_n_) & ~(sysconf(_SC_PAGE_SIZE) - 1);
        specified_chunk_size_ = std::min(chunk_size_ + sysconf(_SC_PAGE_SIZE), config_.file_size);
        current_chunk_ = -1;
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
        data_ = ChunkData(data,
                          [length =specified_chunk_size_](auto data) { munmap(data, length); });

        SetChunkBorders();
        return GetCurrent();
    }
};