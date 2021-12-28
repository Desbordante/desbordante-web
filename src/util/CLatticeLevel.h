#pragma once

#include <map>
#include <vector>

#include "CLatticeVertex.h"

namespace util {

class CLatticeLevel {
private:
    unsigned int arity_;
    std::vector<std::unique_ptr<CLatticeVertex>> vertices_;

public:
    explicit CLatticeLevel(unsigned int m_arity) : arity_(m_arity) {}
    unsigned int GetArity() const { return arity_; }

    std::vector<std::unique_ptr<CLatticeVertex>>& GetVertices() { return vertices_; }

    CLatticeVertex* GetLatticeVertex(const TuplePattern& tuple_pattern) const;
    void Add(std::unique_ptr<CLatticeVertex> vertex);

    // using vectors instead of lists because of .get()
    static void GenerateFirstLevel(std::vector<std::unique_ptr<CLatticeLevel>>& levels, const PatternColumnLayoutRelationData* relation);
    static void GenerateNextLevel(std::vector<std::unique_ptr<CLatticeLevel>>& levels);
    static void ClearLevelsBelow(std::vector<std::unique_ptr<CLatticeLevel>>& levels, unsigned int arity);

    std::string GetString() {
        std::string res;
        for (const auto& v: GetVertices()) {
            res += v->ToString() + "\n";
        }
        return res;
    }


};

} // namespace util

