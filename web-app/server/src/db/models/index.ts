import { Code } from "./UserInfo/Code";
import { Device } from "./UserInfo/Device";
import { Feedback } from "./UserInfo/Feedback";
import { FileInfo } from "./FileInfo/FileInfo";
import { Permission } from "./UserInfo/Permission";
import { Role } from "./UserInfo/Role";
import { Session } from "./UserInfo/Session";
import { User } from "./UserInfo/User";
import { TaskInfo } from "./TaskData/TaskInfo";
import { BaseTaskConfig } from "./TaskData/TaskConfig";
import { ARTaskConfig, CFDTaskConfig, FDTaskConfig, TypoTaskConfig } from "./TaskData/SpecificTaskConfigs";
import { ARTaskResult, CFDTaskResult, FDTaskResult, TypoTaskResult } from "./TaskData/TaskResults";
import { FileFormat } from "./FileInfo/FileFormat";

export const models = {
    User, FileInfo, FileFormat, Feedback,
    Session, Device,
    Role, Code, Permission,
    TaskInfo, BaseTaskConfig,
    FDTaskConfig, CFDTaskConfig, ARTaskConfig, TypoTaskConfig,
    FDTaskResult, CFDTaskResult, ARTaskResult, TypoTaskResult,
};

export type ModelsType = typeof models;


