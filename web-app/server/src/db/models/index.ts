import { Code } from "./Authorization/Code";
import { Device } from "./Authorization/Device";
import { Feedback } from "./Authorization/Feedback";
import { FileInfo } from "./Authorization/FileInfo";
import { Permission } from "./Authorization/Permission";
import { Role } from "./Authorization/Role";
import { Session } from "./Authorization/Session";
import { User } from "./Authorization/User";
import { TaskInfo } from "./TaskData/TaskInfo";
import { BaseTaskConfig } from "./TaskData/BaseTaskConfig";
import { CFDTaskConfig, FDTaskConfig } from "./TaskData/TaskConfigurations";
import { CFDTaskResult, FDTaskResult } from "./TaskData/TaskResults";

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
