#include "FieldWrapper.h"

namespace consumer {

template <>
FieldWrapper<char>::FieldWrapper(const pqxx::field& field) : value_(field.as<std::string>()[0]) {}

template <>
FieldWrapper<std::filesystem::path>::FieldWrapper(const pqxx::field& field)
    : value_(field.as<std::string>()) {}

}