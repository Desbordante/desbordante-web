//
// Created by Ilya Vologin
// https://github.com/cupertank
//


#pragma once

#include <filesystem>
#include <fstream>
#include <string>
#include <vector>

class CSVParser {
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
    std::vector<std::string> ParseString(const std::string& s);
    void GetNextIfHas();

    static inline std::string& rtrim(std::string& s);

public:
    CSVParser() = default;
    explicit CSVParser(const std::filesystem::path& path);
    CSVParser(const std::filesystem::path& path, char separator, bool hasHeader);
    //bool isSameChar(char separator, char escape);
    std::vector<std::string> parseNext();
    bool getHasNext() const { return hasNext;}
    char getSeparator() const { return separator;}
    int getNumberOfColumns() const { return numberOfColumns;}
    std::vector<std::string> getColumnNames() const { return columnNames;}
    std::string getColumnName(int index) const { return columnNames[index];}
    std::string getRelationName() const { return relationName; }
};
