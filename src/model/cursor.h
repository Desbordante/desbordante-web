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
        *fd_ >> GetValue() >> std::ws;
        return GetValue();
    }
    bool HasNext() const {
        return !fd_->eof();
    }
    void print(std::ostream& out) const {
        out << GetValue() << " " << std::boolalpha << HasNext();
    }
};