#include <sstream>
#include <vector>

namespace util {

template <typename T>
static std::vector<T> GetIndicesFromString(const std::string& data) {
    std::stringstream ss(data);
    std::vector<T> result;

    char ch;
    T tmp;
    while (ss >> tmp) {
        result.emplace_back(tmp);
        ss >> ch;
    }
    return result;
}

static std::vector<std::string> GetIndicesStrsFromString(const std::string& data) {
    std::vector<std::string> result;
    for (size_t id : GetIndicesFromString<size_t>(data)) {
        result.emplace_back(std::to_string(id));
    }
    return result;
}

}  // namespace util
