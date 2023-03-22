import {
    ARTaskResult,
    CFDTaskResult,
    FDTaskResult,
    MFDTaskResult,
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
    MFDTaskResult,
} as const;

export default taskResults;
