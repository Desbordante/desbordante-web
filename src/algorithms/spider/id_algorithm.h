#pragma once

#include <enum.h>
#include <filesystem>
#include <utility>

#include "algorithms/primitive.h"
#include "table_processor.h"

namespace algos {

class IDAlgorithm : public Primitive {
    static std::vector<std::filesystem::path> GetPathsFromData(std::filesystem::path const& data) {
        if (std::filesystem::is_regular_file(data)) {
            return {data};
        }

        std::vector<std::filesystem::path> paths;
        for (const auto& entry : std::filesystem::directory_iterator(data)) {
            paths.emplace_back(entry);
        }
        return paths;
    }

protected:
    std::vector<std::unique_ptr<model::IDatasetStream>> streams_;
    std::vector<std::filesystem::path> paths_;
    char separator_;
    bool has_header_;

public:
    explicit IDAlgorithm(std::vector<std::string_view> phase_names)
        : Primitive(std::move(phase_names)) {}
//    IDAlgorithm(std::filesystem::path const& data, char separator, bool has_header,
//                std::vector<std::string_view> phase_names)
//        : Primitive(std::move(phase_names)),
//          paths_(GetPathsFromData(data)),
//          separator_(separator),
//          has_header_(has_header) {
//        streams_.emplace_back(std::make_unique<CSVParser>(paths_.front(), separator_, has_header_));
//    }

    auto& getStream() const {
        return *(streams_[0]);
    }
};

}  // namespace algos
