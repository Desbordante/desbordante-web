import {
    ARTaskConfig,
    CFDTaskConfig,
    FDTaskConfig,
    SpecificTypoClusterTaskConfig,
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
    GeneralTaskConfig,
} as const;

export default taskConfigs;
