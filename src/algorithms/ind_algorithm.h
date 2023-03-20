#pragma once

#include <list>
#include <string>
#include <unordered_map>

#include "algorithms/primitive.h"
#include "model/ind.h"

namespace algos {

class INDAlgorithm : public MultipleRelationPrimitive {
public:
    struct DatasetInfo {
        std::string table_name;
        std::vector<std::string> header;
    };
    using DatasetsOrder = std::vector<DatasetInfo>;
    using IND = model::IND;
    using INDList = std::list<IND>;

public:
    using MultipleRelationPrimitive::MultipleRelationPrimitive;

    virtual DatasetsOrder const& GetDatasetsOrder() const = 0;
    virtual INDList IndList() const = 0;
};


}  // namespace algos
