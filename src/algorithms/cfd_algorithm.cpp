#include "cfd_algorithm.h"

namespace algos {

unsigned long long CFDAlgorithm::Execute() {
    Initialize();

    return ExecuteInternal();
}

}