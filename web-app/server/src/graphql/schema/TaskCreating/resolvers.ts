import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { Role } from "../../../db/models/Authorization/Role";
import { Resolvers } from "../../types/types";
import { findAndUpdateFileRowsCount } from "./csvValidator";

const TaskCreatingResolvers: Resolvers = {
    Mutation: {
        createTaskWithDatasetChoosing: async (
            parent, { props, fileID }, { models, logger, sessionInfo, topicNames }) => {
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new UserInputError("File not found", { fileID });
            }
            const permissions = sessionInfo ? sessionInfo.permissions : Role.getPermissionsForRole("ANONYMOUS")!;
            if (permissions.includes("USE_BUILTIN_DATASETS") && file.isBuiltIn
                || permissions.includes("USE_OWN_DATASETS") && sessionInfo && file.userID === sessionInfo.userID
                || permissions.includes("USE_USERS_DATASETS")) {
                return await models.TaskInfo.saveTaskToDBAndSendEvent(props, fileID, topicNames.DepAlgs, sessionInfo?.userID || null);
            } else {
                throw new ForbiddenError("User hasn't permission for creating task with this dataset");
            }
        },
        // @ts-ignore
        uploadDataset: async (parent, { datasetProps, table }, { models, logger, sessionInfo }) => {
            if (!sessionInfo ||  !sessionInfo.permissions.includes("USE_OWN_DATASETS")) {
                throw new AuthenticationError("User must be logged in and have permission USE_OWN_DATASETS");
            }
            const file = await models.FileInfo.uploadDataset(datasetProps, table, sessionInfo.userID);
            // throws an UserInputError, if file is invalid
            await findAndUpdateFileRowsCount(file, datasetProps.delimiter);
            return file;
        },
        // @ts-ignore
        setDatasetBuiltInStatus: async (parent, { fileID, isBuiltIn }, { models, logger, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("MANAGE_APP_CONFIG")) {
                throw new AuthenticationError("User must be logged in");
            }
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new UserInputError("Incorrect fileID was provided");
            }
            if (file.isBuiltIn === isBuiltIn) {
                logger("Adin tries to change dataset status, but file already has this status");
            } else {
                await file.update({ where: { isBuiltIn } });
            }
            return file;

        },
        createTaskWithDatasetUploading: async (parent, { props, datasetProps, table },
            { models, logger, topicNames, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("USE_OWN_DATASETS")) {
                throw new AuthenticationError("User must be authorized and has permission USE_OWN_DATASETS");
            }
            const file = await models.FileInfo.uploadDataset(datasetProps, table, sessionInfo.userID)
                .catch(e => {
                    logger("Error while file uploading", e);
                    throw new ApolloError("Error while uploading dataset");
                });
            // throws an UserInputError, if file is invalid
            await findAndUpdateFileRowsCount(file, datasetProps.delimiter);

            return await models.TaskInfo.saveTaskToDBAndSendEvent(props, file.ID, topicNames.DepAlgs, sessionInfo.userID);
        },
        deleteTask: async (parent, { taskID }, { models, logger, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            const taskInfo = await models.TaskInfo.findByPk(taskID);
            if (!taskInfo) {
                throw new UserInputError("Task not found");
            }
            if (sessionInfo.permissions.includes("MANAGE_USERS_SESSIONS")
                || taskInfo.userID === sessionInfo.userID) {
                await taskInfo.destroy();
                logger(`Task ${taskID} was deleted by ${sessionInfo.userID}`);
                return { message: `Task with ID = ${taskID} was destroyed (soft)` };
            }
            logger(`User ${sessionInfo.userID} tries to delete task someone else's task ${taskInfo.userID}`);
            throw new AuthenticationError("User doesn't have permission to delete task");
        },
    },
};

export = TaskCreatingResolvers;
