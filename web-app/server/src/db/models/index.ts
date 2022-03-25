import { Code } from "./UserInfo/Code";
import { Device } from "./UserInfo/Device";
import { Feedback } from "./UserInfo/Feedback";
import { FileInfo } from "./FileInfo/FileInfo";
import { Permission } from "./UserInfo/Permission";
import { Role } from "./UserInfo/Role";
import { Session } from "./UserInfo/Session";
import { User } from "./UserInfo/User";
import { TaskState } from "./TaskData/TaskState";
import { BaseTaskConfig } from "./TaskData/TaskConfig";
import { ARTaskConfig, CFDTaskConfig, FDTaskConfig, SpecificTypoClusterConfig,
    TypoClusterConfig,TypoFDTaskConfig } from "./TaskData/SpecificTaskConfigs";
import { ARTaskResult, CFDTaskResult, FDTaskResult, SpecificTypoClusterResult,
    TypoClusterResult,TypoFDTaskResult } from "./TaskData/SpecificTaskResults";
import { FileFormat } from "./FileInfo/FileFormat";

export const models = {
    User, FileInfo, FileFormat, Feedback,
    Session, Device,
    Role, Code, Permission,
    TaskState, BaseTaskConfig,
    FDTaskConfig, CFDTaskConfig, ARTaskConfig,
    TypoFDTaskConfig, TypoClusterConfig, SpecificTypoClusterConfig,
    FDTaskResult, CFDTaskResult, ARTaskResult,
    TypoFDTaskResult, TypoClusterResult, SpecificTypoClusterResult,
};

export type ModelsType = typeof models;


