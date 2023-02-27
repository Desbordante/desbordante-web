#pragma once

#include <enum.h>
#include <filesystem>
#include <utility>

#include <boost/mp11.hpp>

#include "algorithms/primitive.h"
#include "table_processor.h"

namespace algos {

BETTER_ENUM(IMPL, char, SETSV, SETPAIR, VECTORSV, VECTORPAIR)

using impl_tuple = std::tuple<SetStringView, SetPair, VectorStringView, VectorPair>;

class IDAlgorithm : public Primitive {
public:
    struct Config {
        std::vector<std::filesystem::path> paths;
        char separator;
        bool has_header;
        std::size_t ram_limit;
        std::size_t mem_check_frequency = 100000;
        std::size_t threads_count = 1;
        IMPL impl;
    };

    static std::vector<std::filesystem::path> GetPathsFromData(std::filesystem::path const& data) {
        if (std::filesystem::is_regular_file(data)) {
            return {data};
        }

        std::vector<std::filesystem::path> paths;
        for (const auto& entry : std::filesystem::directory_iterator(data)) {
            paths.push_back(entry);
        }
        return paths;
    }
    Config config_;

protected:
    std::vector<std::unique_ptr<model::IDatasetStream>> streams__;
    struct InnerState {
        std::size_t n_cols = 0;
        std::vector<std::string> max_values{};
        std::vector<std::size_t> number_of_columns{};
        std::vector<std::size_t> tableColumnStartIndexes{};
    } state;

public:
    IDAlgorithm(Config config, std::vector<std::string_view> phase_names)
        : Primitive(std::move(phase_names)), config_(std::move(config)) {
        streams__.emplace_back(std::make_unique<CSVParser>(config_.paths.front(), config_.separator,
                                                           config_.has_header));
    }

    auto& getStream() const {
        return *(streams__[0]);
    }
    template <typename TableProcessorBase = BaseTableProcessor, typename... Ts>
    static std::unique_ptr<TableProcessorBase> CreateTableProcessorInstance(IMPL primitive,
                                                                            Ts&&... args) {
        auto const create = [&args...](auto I) -> std::unique_ptr<TableProcessorBase> {
            using ImplType = TableProcessor<std::tuple_element_t<I, impl_tuple>>;
            if constexpr (std::is_convertible_v<ImplType*, TableProcessorBase*>) {
                return std::make_unique<ImplType>(std::forward<Ts>(args)...);
            } else {
                throw std::invalid_argument(
                        "Cannot use " + boost::typeindex::type_id<ImplType>().pretty_name() +
                        " as " + boost::typeindex::type_id<ImplType>().pretty_name());
            }
        };

        return boost::mp11::mp_with_index<std::tuple_size<impl_tuple>>(
                static_cast<size_t>(primitive), create);
    }

    void PreprocessData() {
        std::filesystem::remove_all("temp");
        for (const auto& path : config_.paths) {
            std::cout << "PROCESS NEXT DATASET\n";
            std::cout << "Dataset: " << path.filename() << std::endl;
            auto processor = CreateTableProcessorInstance(
                    config_.impl, path, config_.separator, config_.has_header, config_.ram_limit,
                    config_.mem_check_frequency, config_.threads_count, state.n_cols);
            processor->Execute();
            state.tableColumnStartIndexes.emplace_back(state.n_cols);
            state.n_cols += processor->GetHeaderSize();
            state.number_of_columns.emplace_back(processor->GetHeaderSize());
            auto max_values = processor->GetMaxValues();
            state.max_values.insert(state.max_values.end(), max_values.begin(), max_values.end());
            std::cout << "DATASET PROCESSED\n\n";
        }
    }
};

}  // namespace algos
