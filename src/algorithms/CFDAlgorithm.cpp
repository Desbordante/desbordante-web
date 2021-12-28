#include "CFDAlgorithm.h"

unsigned long long CFDAlgorithm::Execute() {
    Initialize();

    return ExecuteInternal();
}