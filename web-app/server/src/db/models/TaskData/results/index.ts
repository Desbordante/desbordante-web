import {
    ARTaskResult,
    CFDTaskResult,
    FDTaskResult,
    TypoFDTaskResult,
} from "./TasksWithDeps";

import { SpecificTypoClusterResult, StatsResult, TypoClusterResult } from "./SubTasks";

export const taskResults = {
    FDTaskResult,
    CFDTaskResult,
    ARTaskResult,
    TypoFDTaskResult,
    SpecificTypoClusterResult,
    StatsResult,
    TypoClusterResult,
} as const;

export default taskResults;
