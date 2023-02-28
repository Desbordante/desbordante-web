import {
    ARTaskResult,
    CFDTaskResult,
    FDTaskResult,
    TypoFDTaskResult,
} from "./TasksWithDeps";
import { SpecificTypoClusterResult, StatsResult, TypoClusterResult } from "./SubTasks";
import { MFDTaskResult } from "./BaseTaskResult";

export const taskResults = {
    FDTaskResult,
    CFDTaskResult,
    ARTaskResult,
    TypoFDTaskResult,
    SpecificTypoClusterResult,
    StatsResult,
    TypoClusterResult,
    MFDTaskResult,
} as const;

export default taskResults;
