import { ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { PrimitiveType } from "../../../db/models/TaskData/TaskConfig";
import { Resolvers } from "../../types/types";
import { Permission } from "../../../db/models/UserInfo/Permission";

export const TaskCreatingResolvers: Resolvers = {
    Mutation: {
        createTypoMinerTask: async (parent, { props }, { models, sessionInfo, topicNames }) => {
            const permissions = Permission.getPermissionsBySessionInfo(sessionInfo);
            const expectedTypes: PrimitiveType[] = ["TypoCluster", "SpecificTypoCluster"];
            if (!expectedTypes.includes(props.type)) {
                throw new UserInputError(`Received incorrect type ${props.type}. Expected: ${expectedTypes}`);
            }
            if (permissions.includes("USE_BUILTIN_DATASETS")) {
                return await models.TaskState.findTaskOrAddToDBAndSendEvent(props,
                    topicNames.DepAlgs, sessionInfo?.userID || null);
            } else {
                throw new ForbiddenError("User hasn't permission for creating task with this dataset");
            }
        },
        createTaskWithDatasetChoosing: async (
            parent, { props, fileID }, { models, sessionInfo, topicNames }) => {
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new UserInputError("File not found", { fileID });
            }
            if (props.type === "AR") {
                const fileFormat = await file.$get("fileFormat");
                if (!fileFormat) {
                    throw new UserInputError("This dataset doesn't support AR algorithms");
                }
            } else if (props.type === "CFD") {
                throw new UserInputError("CFD not implemented yet");
            }
            const permissions = Permission.getPermissionsBySessionInfo(sessionInfo);
            if (permissions.includes("USE_BUILTIN_DATASETS") && file.isBuiltIn
                || permissions.includes("USE_OWN_DATASETS") && sessionInfo
                   && file.userID === sessionInfo.userID
                || permissions.includes("USE_USERS_DATASETS")) {
                return await models.TaskState.saveTaskToDBAndSendEvent(props,
                    topicNames.DepAlgs, sessionInfo?.userID || null, fileID);
            } else {
                throw new ForbiddenError("User hasn't permission for creating task with this dataset");
            }
        },
        // @ts-ignore
        uploadDataset: async (parent, { datasetProps, table }, { models, sessionInfo }) => {
            if (!sessionInfo ||  !sessionInfo.permissions.includes("USE_OWN_DATASETS")) {
                throw new AuthenticationError("User must be logged in and have permission USE_OWN_DATASETS");
            }
            return await models.FileInfo.uploadDataset(datasetProps, table, sessionInfo.userID);
        },
        // // @ts-ignore
        // setDatasetBuiltInStatus: async (parent, { fileID, isBuiltIn }, { models, logger, sessionInfo }) => {
        //     if (!sessionInfo || !sessionInfo.permissions.includes("MANAGE_APP_CONFIG")) {
        //         throw new ForbiddenError("User doesn't have permission");
        //     }
        //     const file = await models.FileInfo.findByPk(fileID);
        //     if (!file) {
        //         throw new UserInputError("Incorrect fileID was provided");
        //     }
        //     if (file.isBuiltIn === isBuiltIn) {
        //         logger("Admin tries to change dataset status, but file already has this status");
        //     } else {
        //         await file.update({ isBuiltIn });
        //     }
        //     return file;
        // },
        createTaskWithDatasetUploading: async (parent, { props, datasetProps, table },
            { models, topicNames, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("USE_OWN_DATASETS")) {
                throw new AuthenticationError("User must be authorized and has permission USE_OWN_DATASETS");
            }
            if (props.type === "CFD") {
                throw new UserInputError("CFD not implemented yet");
            }
            const file = await models.FileInfo.uploadDataset(datasetProps, table,
                sessionInfo.userID, props.type === "AR");
            return await models.TaskState.saveTaskToDBAndSendEvent(props, topicNames.DepAlgs, sessionInfo.userID, file.fileID);
        },
        deleteTask: async (parent, { taskID, safeDelete }, { models, logger, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            const taskInfo = await models.TaskState.findByPk(taskID);
            if (!taskInfo) {
                throw new UserInputError("Task not found");
            }
            if (sessionInfo.permissions.includes("MANAGE_USERS_SESSIONS")
                || taskInfo.userID === sessionInfo.userID) {
                await taskInfo.fullDestroy(!safeDelete);
                logger(`Task ${taskID} was deleted by ${sessionInfo.userID} with safeDelete = ${safeDelete}`);
                return { message: `Task with ID = ${taskID} was destroyed` };
            }
            logger(`User ${sessionInfo.userID} tries to delete task someone else's task ${taskInfo.userID}`);
            throw new AuthenticationError("User doesn't have permission to delete this task");
        },
    },
};
