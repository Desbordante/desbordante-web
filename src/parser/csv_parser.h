//
// Created by Ilya Vologin
// https://github.com/cupertank
//


#pragma once

#include <filesystem>
#include <fstream>
#include <string>
#include <vector>

#include "idataset_stream.h"

class CSVParser : public model::IDatasetStream {
public:

    struct CsvDataConfig {
        std::filesystem::path path;
        char separator = ',';
        bool has_header = true;
    };
private:
    std::ifstream source_;
    char separator_;
    char escape_symbol_ = '\\';
    char quote_ = '\"';
    bool has_header_;
    bool has_next_;
    std::string next_line_;
    int number_of_columns_;
    std::vector<std::string> column_names_;
    std::string relation_name_;
    void GetNext();
    void PeekNext();
    void GetLine(const unsigned long long line_index);
    std::vector<std::string> ParseString(const std::string& s) const;
    void GetNextIfHas();
    void SkipLine();

    static inline std::string& rtrim(std::string& s);

public:
    CSVParser() = default;
    explicit CSVParser(const std::filesystem::path& path);
    CSVParser(const std::filesystem::path& path, char separator, bool has_header);
    explicit CSVParser(CsvDataConfig const& data_config);

    std::vector<std::string> GetNextRow() override;
    std::string GetUnparsedLine(const unsigned long long line_index);
    std::vector<std::string> ParseLine(const unsigned long long line_index);
    bool HasNextRow() const override {
        return has_next_;
    }
    char GetSeparator() const {
        return separator_;
    }
    size_t GetNumberOfColumns() const override { return number_of_columns_; }
    std::string GetColumnName(int index) const override { return column_names_[index]; }
    std::vector<std::string> const& GetColumnNames() const override { return column_names_; }
    std::string GetRelationName() const override { return relation_name_; }
    void Reset() override;
};
