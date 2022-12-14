#pragma once

#include "ar_algorithm_enums.h"
#include "algorithms/create_primitive.h"

#include <string>
#include <pqxx/row>
#include <pqxx/result>
#include <functional>
#include <boost/any.hpp>
#include <filesystem>
#include <utility>
#include <cassert>
#include <iostream>

namespace consumer {

class TaskConfig;

template <typename T>
class FieldWrapper {
    T value_;
public:
    explicit FieldWrapper(const pqxx::field& field) : value_(field.as<T>()) {}
    explicit FieldWrapper(const pqxx::field& field, std::function<void(T&)> formatter)
        : FieldWrapper<T>(field) {
        formatter(value_);
    }

    explicit FieldWrapper(const pqxx::field& field, std::function<T&(T&)> formatter)
        : FieldWrapper<T>(field, [&formatter](T& value) { value = formatter(value); }) {}

    boost::any GetValue() {
        return value_;
    }
};

template <>
FieldWrapper<char>::FieldWrapper(const pqxx::field& field);

template <>
FieldWrapper<unsigned int>::FieldWrapper(const pqxx::field& field);

template <>
FieldWrapper<std::filesystem::path>::FieldWrapper(const pqxx::field& field);

template <>
FieldWrapper<algos::InputFormat>::FieldWrapper(const pqxx::field& field);

template <>
FieldWrapper<algos::PrimitiveType>::FieldWrapper(const pqxx::field& field);

class ExtendedAttributeBase {

public:
    using NotNullFunction = std::function<bool(const consumer::TaskConfig&)>;
    virtual boost::any GetValue(const pqxx::field& field) = 0;

    virtual boost::any GetValue(const pqxx::row& row) {
        const auto& field = row["\"" + db_attr_name_ + "\""];
        return this->GetValue(field);
    }

    virtual boost::any GetValue() {
        return this->GetValue(pqxx::row{});
    }

    bool HasValue() {
        return db_attr_name_.empty();
    }

    bool IsNull(const TaskConfig& config) {
        return !not_null_if_(config);
    }

    template <typename ...T>
    std::pair<std::string, boost::any> GetConfigParam(T&& ...arg) {
        return {GetConfigAttrName(), GetValue(std::forward<T...>(arg...))};
    }

    std::pair<std::string, boost::any> GetConfigParam() {
        assert(HasValue());
        return {GetConfigAttrName(), GetValue()};
    }

    [[nodiscard]] const std::string& GetDbAttrName() const {
        return db_attr_name_;
    }

    [[nodiscard]] const std::string& GetConfigAttrName() const {
        return config_attr_name_;
    }

protected:
    std::string db_attr_name_;
    std::string config_attr_name_;
    NotNullFunction not_null_if_;

    explicit ExtendedAttributeBase(std::string db_attr_name,
        std::string config_attr_name, NotNullFunction f = [](const TaskConfig&) { return true; })
        : db_attr_name_(std::move(db_attr_name)), config_attr_name_(std::move(config_attr_name)), not_null_if_(std::move(f)) {}
};

template <typename T>
class ExtendedAttribute : public ExtendedAttributeBase {
public:

    explicit ExtendedAttribute(
        std::string db_attr_name, std::string config_attr_name,
        std::function<void(T&)> formatter = [](T&) {},
        NotNullFunction not_null_if = [](const TaskConfig&) { return true; })
        : ExtendedAttributeBase(db_attr_name, config_attr_name, not_null_if), formatter_(formatter) {}

    explicit ExtendedAttribute(
        std::string db_attr_name, std::string config_attr_name,
        NotNullFunction not_null_if)
        : ExtendedAttribute(db_attr_name, config_attr_name, [](T&) {}, not_null_if) {}

    explicit ExtendedAttribute(
        std::string config_attr_name,
        std::function<void(T&)> formatter = [](T&) {},
        NotNullFunction not_null_if = [](const TaskConfig&) { return true; })
        : ExtendedAttribute("", config_attr_name, formatter, not_null_if) {}

    boost::any GetValue(const pqxx::field& field) override {
        return FieldWrapper<T>(field, formatter_).GetValue();
    }

private:
    std::function<void(T&)> formatter_;
};

template <typename T>
class CreateAttribute : public ExtendedAttributeBase {
    T value_;

private:
public:
    explicit CreateAttribute(std::string config_attr_name, T value)
        : ExtendedAttributeBase("", config_attr_name), value_(value) {}


    boost::any GetValue(const pqxx::field&) override {
        return { value_ };
    }

    boost::any GetValue() override {
        return { value_ };
    }
};

}