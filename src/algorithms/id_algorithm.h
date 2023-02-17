#pragma once

#include <filesystem>

#include "algorithms/primitive.h"
#include "model/column_reader.h"

namespace algos {

class IDAlgorithm : public Primitive {
public:
    struct Config {
//        std::filesystem::path path; // Directory or file
        std::vector<std::filesystem::path> paths;
        char separator;
        bool has_header;
        std::size_t threads;
        // bytes
        std::size_t ram_limit;
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
    static constexpr auto TEMP_DIR = "temp";
    static constexpr std::size_t memory_check_frequency = 100;
    Config config_;
protected:
    std::vector<std::unique_ptr<model::IDatasetStream>> streams_;
    model::ColumnReader::ColumnsStats column_stats_;
public:
    IDAlgorithm(Config const& config, std::vector<std::string_view> phase_names)
        : Primitive(std::move(phase_names)), config_(config) {
        for (auto const& file: config.paths) {
            streams_.emplace_back(
                    std::make_unique<CSVParser>(file, config.separator, config.has_header));
        }
    }
//    IDAlgorithm(Config const& config, std::vector<std::string_view> phase_names)
//        : Primitive(std::move(phase_names)), config_(config) {
//        auto paths{GetPathsFromData(config.path)};
//        streams_.reserve(paths.size());
//        for (auto const& file: paths) {
//            streams_.emplace_back(
//                    std::make_unique<CSVParser>(file, config.separator, config.has_header));
//        }
//    }
    auto& getStream() const {
        return *(streams_[0]);
    }

    void PreprocessData() {
        model::ColumnReader cr{streams_, TEMP_DIR, memory_check_frequency, config_.ram_limit};
        cr.Execute();
        column_stats_ = *cr.ReleaseColumnStats();
    }
};

}  // namespace algos
//./build/target/Desbordante_run customer supplier lineitem region nation orders part partsupp