import {
    ARTaskConfig,
    CFDTaskConfig,
    FDTaskConfig,
    MFDTaskConfig,
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
    MFDTaskConfig,
} as const;

export default taskConfigs;
