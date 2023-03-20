#pragma once

#include <cmath>
#include <set>
#include <string>
#include <string_view>
#include <thread>
#include <utility>
#include <vector>

#include <boost/range/iterator_range.hpp>
#include <boost/tokenizer.hpp>
#include <easylogging++.h>

#include "base_table_processor.h"
#include "chunked_file_reader.h"
#include "model/idataset_stream.h"
#include "sorted_column_writer.h"
#include "spider/enums.h"
#include "util/value_handler.h"

namespace algos::ind::preproc {

namespace details {

/* FIXME:
 * At the moment, we are restricted to using enum classes KeyTypeImpl and ColTypeImpl
 * as non-type template parameters due to limitations in c++17.
 * However, c++20 allows for the use of constexpr class values as non-type template
 * parameters, which will resolve this issue.
 * After upgrading to c++20 we need to use KeyType and ColType instead of 'Impl' enums
 * */

template <ind::details::KeyTypeImpl key, ind::details::ColTypeImpl col_type>
class TableProcessor : public BaseTableProcessor {
protected:
    using KeyTypeImpl = ind::details::KeyTypeImpl;
    using ColTypeImpl = ind::details::ColTypeImpl;
    using ValueType = std::tuple_element_t<(int)key, util::KeysTuple>;
    using ValueHandler = util::ValueHandler<ValueType>;
    using Column = std::conditional_t<col_type == ColTypeImpl::SET,
                                      std::set<ValueType, typename ValueHandler::LessCmp>,
                                      std::vector<ValueType>>;
    using Columns = std::vector<Column>;

private:
    static ValueHandler CreateHandler(BufferPtr start) {
        if constexpr (Is<KeyTypeImpl::PAIR>()) {
            return ValueHandler(start);
        } else {
            return ValueHandler();
        }
    }

    void FinalSpill() final {
        if (std::any_of(columns_.begin(), columns_.end(), [](auto const& values) { return values.size() > 0; })) {
            writer_.SpillColumnsToDisk(handler_.print_, GetSortedColumns(handler_), false);
        }
    }

    void ProcessRow(std::vector<std::string> const& row) final {
        std::size_t length{0};
        for (auto const& value: row) {
            length += value.size() + 1;
        }
        if (buffer_.AddRow(row, length)) {
            char* line_begin = buffer_.GetCur() - length;
            MemoryLimitProcess(cur_row_);
            for (std::size_t cur_attr = 0; cur_attr != row.size();) {
                auto& value = row[cur_attr];
                if (!value.empty()) {
                    memcpy(line_begin, value.data(), value.size() + 1);
//                    if (cur_attr == 0) {
//                        std::cout << value << " " << std::string_view {line_begin,
//                                                                      value.size()} << '\n';
//                    }
                    if constexpr (Is<KeyTypeImpl::STRING_VIEW>()) {
                        EmplaceValueToColumn(cur_attr, line_begin, value.size());
                    } else if constexpr (Is<KeyTypeImpl::PAIR>()) {
                        EmplaceValueToColumn(cur_attr, line_begin - buffer_.GetData().data(),
                                             value.size());
                    }
                    line_begin += value.size();
                }
                cur_attr++;
                line_begin++;
            }
        } else {
            std::cout << "swapping\n";
            writer_.SpillColumnsToDisk(handler_.print_, GetSortedColumns(handler_), true);
            std::cout << "SWAP ON " << cur_row_ << "\n";
            buffer_.Clear();
            ProcessRow(row);
        }
    }

    virtual Columns& GetSortedColumns(ValueHandler const& handler) = 0;
    virtual bool IsLimitReached(std::size_t current_row) = 0;

    template <typename... Ts>
    void EmplaceValueToColumn(std::size_t attr_id, Ts... args) {
        Column& column = columns_[attr_id];
        if constexpr (Is<ColTypeImpl::VECTOR>()) {
            column.emplace_back(std::forward<Ts>(args)...);
        } else if constexpr (Is<ColTypeImpl::SET>()) {
            column.emplace(std::forward<Ts>(args)...);
        }
    }

    virtual void ReserveColumns(const ValueHandler& handler) = 0;

    void MemoryLimitProcess(std::size_t current_row) {
        if (IsLimitReached(current_row)) {
            writer_.SpillColumnsToDisk(handler_.print_, GetSortedColumns(handler_), true);
        }
    }
    virtual std::size_t GetCurrentMemory() const = 0;

protected:
    Columns columns_;
    ValueHandler handler_;

    template <KeyTypeImpl key_value>
    static constexpr bool Is() {
        return (int)key == (int)key_value;
    }

    template <ColTypeImpl data_value>
    static constexpr bool Is() {
        return (int)col_type == (int)data_value;
    }

public:
    ~TableProcessor() override = default;

    template <typename... Args>
    explicit TableProcessor(Args&&... args)
        : BaseTableProcessor(std::forward<Args>(args)...),
          handler_(CreateHandler(buffer_.GetData().data())) {
        if constexpr (Is<KeyTypeImpl::PAIR>()) {
            chunk_m_limit_ = std::min((double)std::numeric_limits<unsigned int>::max(),
                                      (double)chunk_m_limit_);
        }
    }
};

template <ind::details::KeyTypeImpl key>
class SetBasedTableProcessor final : public TableProcessor<key, ind::details::ColTypeImpl::SET> {
    using ColTypeImpl = ind::details::ColTypeImpl;
    using ParentType = TableProcessor<key, ColTypeImpl::SET>;
    using ValueType = typename ParentType::ValueType;
    using Columns = typename ParentType::Columns;
    using Column = typename ParentType::Column;
    using ValueHandler = typename ParentType::ValueHandler;

private:
    std::size_t memory_check_frequency_;

    Columns& GetSortedColumns(ValueHandler const&) final {
        return this->columns_;
    }
    bool IsLimitReached(std::size_t current_row) final {
        if (current_row % memory_check_frequency_ == 0) {
            return GetCurrentMemory() > (this->memory_limit_ - this->chunk_m_limit_);
        }
        return false;
    }

    void ReserveColumns(const ValueHandler& handler) final {
        this->columns_.assign(this->GetHeaderSize(), Column{handler.less_});
    }

    std::size_t GetCurrentMemory() const final {
        double coeff = 200.0 / 167;
        std::size_t estimation = sizeof(Columns);
        for (auto const& column : this->columns_) {
            estimation += column.size() * sizeof(std::_Rb_tree_node<ValueType>);
        }
        return (std::size_t)(coeff * (double)estimation);
    }
    void InitAdditionalChunkInfo(char*, char*) final {
        ReserveColumns(this->handler_);
    }

public:
    SetBasedTableProcessor(SortedColumnWriter& writer, CSVParser::IDatasetStream& stream,
                           std::size_t memory_limit, std::size_t mem_check_frequency)
        : ParentType(writer, stream, memory_limit, memory_limit / 3 * 2),
          memory_check_frequency_(mem_check_frequency) {}

    ~SetBasedTableProcessor() final = default;
};

template <ind::details::KeyTypeImpl key>
class VectorBasedTableProcessor final
    : public TableProcessor<key, ind::details::ColTypeImpl::VECTOR> {
    using ColTypeImpl = ind::details::ColTypeImpl;
    using ParentType = TableProcessor<key, ColTypeImpl::VECTOR>;
    using BufferPtr = typename ParentType::BufferPtr;
    using ValueType = typename ParentType::ValueType;
    using Columns = typename ParentType::Columns;
    using ValueHandler = typename ParentType::ValueHandler;

    std::size_t threads_count_;
    std::size_t rows_limit_;
    std::size_t rows_count_;

//    std::size_t CalculateRowsLimit(std::size_t rows_number) const {
//        std::size_t row_memory = this->GetHeaderSize() * sizeof(ValueType);
//        std::size_t needed_memory = rows_number * row_memory;
//        std::size_t data_memory_limit = this->memory_limit_ - this->chunk_m_limit_;
//
//        std::size_t rows_limit;
//        if (needed_memory > data_memory_limit) {
//            std::size_t times = std::ceil((double)needed_memory / (double)data_memory_limit);
//            rows_limit = std::ceil((double)rows_number / (double)times);
//        } else {
//            rows_limit = rows_number;
//        }
//        return rows_limit;
//    }
    std::size_t CalculateRowsLimit() const {
        std::size_t row_memory = this->GetHeaderSize() * sizeof(ValueType);
        std::size_t data_memory_limit = this->memory_limit_ - this->chunk_m_limit_;

        return std::ceil(data_memory_limit / row_memory);

//        std::size_t rows_limit;
//        if (needed_memory > data_memory_limit) {
//            std::size_t times = std::ceil((double)needed_memory / (double)data_memory_limit);
//            rows_limit = std::ceil((double)rows_number / (double)times);
//        } else {
//            rows_limit = rows_number;
//        }
//        return rows_limit;
    }

    void InitAdditionalChunkInfo(BufferPtr start, BufferPtr end) final {
        rows_limit_ = CalculateRowsLimit();
        ReserveColumns(this->handler_);
    }

    void ReserveColumns(ValueHandler const&) final {
        this->columns_.assign(this->GetHeaderSize(), {});
        for (auto& col : this->columns_) {
            col.reserve(rows_limit_);
        }
    }

    void Sort(ValueHandler const& handler) {
        auto sort_time = std::chrono::system_clock::now();
        std::vector<std::thread> threads;
        for (std::size_t j = 0; j < this->GetHeaderSize(); ++j) {
            /* TODO: At this point it is preferable to use a thread pool */
            threads.emplace_back([&col = this->columns_[j], &handler]() {
                std::sort(col.begin(), col.end(), handler.less_);
                col.erase(unique(col.begin(), col.end(), handler.eq_), col.end());
            });
            if ((j != 0 && j % threads_count_ == 0) || j == this->GetHeaderSize() - 1) {
                for (auto& th : threads) {
                    th.join();
                }
                threads.clear();
            }
        }
        auto sorting_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now() - sort_time);
        LOG(INFO) << "Sorting: " << sorting_time.count();
    }

    Columns& GetSortedColumns(ValueHandler const& handler) final {
        Sort(handler);
        return this->columns_;
    }

    bool IsLimitReached(std::size_t current_row) final {
        return rows_count_ != rows_limit_ && current_row % rows_limit_ == 0;
    }

    std::size_t GetCurrentMemory() const final {
        std::size_t row_memory = this->GetHeaderSize() * sizeof(ValueType);
        return row_memory * this->columns_.front().capacity();
    }

public:
    VectorBasedTableProcessor(SortedColumnWriter& writer, CSVParser::IDatasetStream& stream,
                              std::size_t memory_limit, std::size_t threads_count)
        : ParentType(writer, stream, memory_limit, memory_limit / 2),
          threads_count_(threads_count) {}

    ~VectorBasedTableProcessor() final = default;
};

}  // namespace details

template <ind::details::KeyTypeImpl key, ind::details::ColTypeImpl col>
using ChunkProcessor = std::conditional_t<ind::details::ColTypeImpl::SET == col,
                                          details::SetBasedTableProcessor<key>,
                                          details::VectorBasedTableProcessor<key>>;

}  // namespace algos::ind::preproc
