#pragma once

#include <filesystem>

#include "algorithms/primitive.h"


namespace algos {

class IDAlgorithm : public Primitive {
public:
    struct Config {
        std::filesystem::path path; // Directory or file
        char separator;
        bool has_header;
        std::size_t threads;
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

    std::vector<std::string> max_values;

protected:
    Config config_;
protected:
    std::vector<std::unique_ptr<model::IDatasetStream>> streams_;

public:
    IDAlgorithm(Config const& config, std::vector<std::string_view> phase_names)
        : Primitive(std::move(phase_names)), config_(config) {
        auto paths{GetPathsFromData(config.path)};
        streams_.reserve(paths.size());
        for (auto const& file: paths) {
            streams_.emplace_back(
                    std::make_unique<CSVParser>(file, config.separator, config.has_header));
        }
    }
    auto& getStream() const {
        return *(streams_[0]);
    }
};

}  // namespace algos
