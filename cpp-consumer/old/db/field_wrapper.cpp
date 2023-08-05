#include "field_wrapper.h"

#include "names_resolvers.h"

namespace consumer {

template <>
FieldWrapper<char>::FieldWrapper(const pqxx::field& field) : value_(field.as<std::string>()[0]) {}

template <>
FieldWrapper<std::filesystem::path>::FieldWrapper(const pqxx::field& field)
    : value_(field.as<std::string>()) {}

template <>
FieldWrapper<unsigned int>::FieldWrapper(const pqxx::field& field)
    : value_((unsigned int)field.as<long long>()) {}

template <>
FieldWrapper<algos::InputFormat>::FieldWrapper(const pqxx::field& field)
    : value_(algos::InputFormat::_from_string_nocase(field.as<std::string>().c_str())) {}

template <>
FieldWrapper<algos::PrimitiveType>::FieldWrapper(const pqxx::field& field)
    : value_(algos::PrimitiveType::_from_string_nocase(
              resolvers::ResolveAlgoName(field.as<std::string>()).c_str())) {}
}  // namespace consumer
