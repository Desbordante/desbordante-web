import { Code } from "./UserInfo/Code";
import { Device } from "./UserInfo/Device";
import { Feedback } from "./UserInfo/Feedback";
import { FileInfo } from "./FileInfo/FileInfo";
import { Permission } from "./UserInfo/Permission";
import { Role } from "./UserInfo/Role";
import { Session } from "./UserInfo/Session";
import { User } from "./UserInfo/User";
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
