import { Code } from "./Authorization/Code";
import { Device } from "./Authorization/Device";
import { Feedback } from "./Authorization/Feedback";
import { FileInfo } from "./FileInfo/FileInfo";
import { Permission } from "./Authorization/Permission";
import { Role } from "./Authorization/Role";
import { Session } from "./Authorization/Session";
import { User } from "./Authorization/User";
import { TaskInfo } from "./TaskData/TaskInfo";
import { BaseTaskConfig } from "./TaskData/BaseTaskConfig";
import { ARTaskConfig, CFDTaskConfig, FDTaskConfig } from "./TaskData/TaskConfigurations";
import { ARTaskResult, CFDTaskResult, FDTaskResult } from "./TaskData/TaskResults";
import { FileFormat } from "./FileInfo/FileFormat";

export const models = {
    User, FileInfo, FileFormat, Feedback,
    Session, Device,
    Role, Code, Permission,
    TaskInfo, BaseTaskConfig,
    FDTaskConfig, CFDTaskConfig, ARTaskConfig,
    FDTaskResult, CFDTaskResult, ARTaskResult,
};

export type ModelsType = typeof models;
