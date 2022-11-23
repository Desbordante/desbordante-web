import {
    ARTaskConfig,
    CFDTaskConfig,
    FDTaskConfig,
    SpecificTypoClusterTaskConfig,
    StatsTaskConfig,
    TypoClusterTaskConfig,
    TypoFDTaskConfig,
} from "./SpecificConfigs";
import { GeneralTaskConfig } from "./GeneralTaskConfig";

export const taskConfigs = {
    FDTaskConfig,
    CFDTaskConfig,
    ARTaskConfig,
    TypoFDTaskConfig,
    TypoClusterTaskConfig,
    SpecificTypoClusterTaskConfig,
    StatsTaskConfig,
    GeneralTaskConfig,
} as const;

export default taskConfigs;
