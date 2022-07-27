import {
    ARTaskResult,
    CFDTaskResult,
    FDTaskResult,
    TypoFDTaskResult,
} from "./TasksWithDeps";
import { SpecificTypoClusterResult, TypoClusterResult } from "./SubTasks";

export const taskResults = {
    FDTaskResult,
    CFDTaskResult,
    ARTaskResult,
    TypoFDTaskResult,
    SpecificTypoClusterResult,
    TypoClusterResult,
} as const;

export default taskResults;
