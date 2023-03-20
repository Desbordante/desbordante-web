#pragma once

#include <string>
#include <utility>
#include <vector>

#include <boost/tokenizer.hpp>

#include "chunked_file_reader.h"
#include "model/idataset_stream.h"
#include "parser/csv_parser.h"
#include "sorted_column_writer.h"
#include <cmath>

namespace algos::ind::preproc {

class Buffer {
public:
    using ChunkPtr = char*;
private:
    std::vector<char> data_;
    std::size_t offset_;
//    char * cur_pos_;
    std::size_t chunk_size_limit_;

public:
    explicit Buffer(std::size_t mem_limit): offset_(0), chunk_size_limit_(mem_limit) {
        data_.reserve(chunk_size_limit_);
    }

    bool CannotReserveMoreMemory() {
        return true;
//        if (data_.capacity() == chunk_size_limit_) {
//            return true;
//        }
//        if (chunk_size_limit_ >= data_.capacity() * 2) {
//            data_.reserve(data_.capacity() * 2);
//        } else {
//            data_.reserve(data_.capacity());
//        }
//        std::cout << "realloc\n";
//        return false;
    }

    bool WillLimitReached(std::size_t row_length) {
        if (data_.capacity() - row_length > offset_) {
            return false;
        }
        std::cout << "try reserve more memory\n";
        return CannotReserveMoreMemory() && WillLimitReached(row_length);
    }

    std::vector<char>& GetData() {
        return data_;
    }
    auto GetCur() {
        return data_.data() + offset_;
    }
    void Clear() {
        data_.clear();
        data_.reserve(chunk_size_limit_);
        offset_ = 0;
    }

    bool AddRow(std::vector<std::string> const& row, std::size_t length_in_bytes) {
        if (!WillLimitReached(length_in_bytes)) {
            auto cur = GetCur();
//            std::cout << "then " << std::addressof(cur) << "\n";

            for (auto const& value: row) {
                if (GetCur() + value.size() + 1 >= data_.data() + data_.capacity()) {
                    std::cout << "something went wrong\n";
                    std::cout << data_.capacity() << " " << offset_ << " " << length_in_bytes << '\n';
                    throw std::runtime_error("error");
                }
                for (auto& ch:value) {
                    data_.emplace_back(ch);
                }
                data_.emplace_back('\0');
//                data_.insert(data_.end(), value.begin(), value.end());
//                memcpy(GetCur(), value.data(), value.size() + 1);
            }
            offset_ += length_in_bytes;

            return true;
        }
        return false;
    }
};

class BaseTableProcessor {
public:
    using BufferPtr = Buffer::ChunkPtr;

private:
    //    virtual void ProcessChunk(BufferPtr begin, BufferPtr end, bool is_chunk) = 0;

    //    BufferPtr InitHeader(BufferPtr start);

    virtual void InitAdditionalChunkInfo(BufferPtr, BufferPtr) {}

protected:
//    using EscapedList = boost::escaped_list_separator<char>;
//    using Tokenizer = boost::tokenizer<EscapedList, char const*>;

    std::size_t cur_row_;
    model::IDatasetStream& stream_;
    SortedColumnWriter& writer_;

    std::size_t memory_limit_;
    std::size_t chunk_m_limit_;
    Buffer buffer_;
    virtual void ProcessRow(std::vector<std::string> const& row) = 0;
    virtual void FinalSpill() =0;

public:
    BaseTableProcessor(SortedColumnWriter& writer, model::IDatasetStream& stream,
                       std::size_t memory_limit, std::size_t chunk_m_limit)
        : stream_(stream),
          writer_(writer),
          memory_limit_(memory_limit),
          chunk_m_limit_(chunk_m_limit),
          buffer_(chunk_m_limit_)
    {}

    virtual ~BaseTableProcessor() = default;

    std::size_t GetHeaderSize() const {
        return stream_.GetNumberOfColumns();
    }
    std::vector<std::string> const& GetHeader() const {
        return stream_.GetColumnNames();
    }
    void Execute();
};

}  // namespace algos::ind::preproc
