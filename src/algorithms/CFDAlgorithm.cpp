#include "CFDAlgorithm.h"

namespace algos {

unsigned long long CFDAlgorithm::Execute() {
    Initialize();

    return ExecuteInternal();
}

}