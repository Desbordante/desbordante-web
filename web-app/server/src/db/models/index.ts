import { Device } from "./Device";
import { Feedback } from "./Feedback";
import { FileInfo } from "./FileInfo";
import { Role } from "./Role";
import { Session } from "./Session";
import { TaskInfo } from "./TaskInfo";
import { BaseTaskConfig } from "./BaseTaskConfig";
import { CFDTaskConfig, FDTaskConfig } from "./TaskConfigurations";
import { CFDTaskResult, FDTaskResult } from "./TaskResults";
import { Code, Permission, User } from "./User";

export const models = {
    User, FileInfo, Feedback,
    Session, Device,
    Role, Code, Permission,
    TaskInfo, BaseTaskConfig,
    FDTaskConfig, FDTaskResult,
    CFDTaskConfig,
    CFDTaskResult,
};

export type ModelsType = typeof models;
