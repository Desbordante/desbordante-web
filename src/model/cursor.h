#pragma once

template <typename T>
class Cursor {
    std::unique_ptr<std::ifstream> fd_;
    T value_;

public:
    explicit Cursor(std::unique_ptr<std::ifstream> fd) : fd_(std::move(fd)) {
        value_ = GetNext();
    }
    T const& GetValue() const {
        return value_;
    }
    T& GetValue() {
        return value_;
    }
    T const& GetNext() {
        std::getline(*fd_, GetValue());
        return GetValue();
    }
    bool HasNext() const {
        return !fd_->eof();
    }
    void print(std::ostream& out) const {
        out << GetValue() << " " << std::boolalpha << HasNext();
    }
};

//template <typename T>
//class Cursor {
//    std::unique_ptr<std::ifstream> fd_;
//    T value_;
//    bool has_next_;
//public:
//    explicit Cursor(std::unique_ptr<std::ifstream> fd) : fd_(std::move(fd)) {
//        value_ = GetNext();
//        has_next_ = !fd_->eof();
//    }
//    T const& GetValue() const {
//        return value_;
//    }
//    T& GetValue() {
//        return value_;
//    }
//    T const& GetNext() {
//        std::getline(*fd_, GetValue());
//        has_next_ = !fd_->eof();
//        return GetValue();
//    }
//    bool HasNext() const {
//        return has_next_;
//    }
//    void print(std::ostream& out) const {
//        out << GetValue() << " " << std::boolalpha << HasNext();
//    }
//};