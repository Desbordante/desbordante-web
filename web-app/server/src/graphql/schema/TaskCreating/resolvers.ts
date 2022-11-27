import { ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { Permission } from "../../../db/models/UserData/Permission";
import { Resolvers } from "../../types/types";
import { TaskCreatorFactory } from "./Creator/AbstractCreator";

export const TaskCreatingResolvers: Resolvers = {
    Mutation: {
        createSpecificTask: async (_, { props, forceCreate }, context) => {
            const { sessionInfo } = context;
            const permissions = Permission.getPermissionsBySessionInfo(sessionInfo);
            if (permissions.includes("USE_BUILTIN_DATASETS")) {
                const { models } = context;
                const file = await models.GeneralTaskConfig.getFileInfo(
                    props.parentTaskID!
                );
                return await TaskCreatorFactory.build(
                    props.type,
                    context,
                    props,
                    file,
                    forceCreate
                );
            } else {
                throw new ForbiddenError(
                    "User hasn't permission for creating task with this dataset"
                );
            }
        },
        createMainTaskWithDatasetChoosing: async (
            parent,
            { props, fileID, forceCreate },
            context
        ) => {
            const { models, sessionInfo } = context;
            const file = await models.FileInfo.findOne({
                where: {
                    fileID,
                    isValid: true,
                },
            });
            if (!file) {
                throw new UserInputError("File not found", { fileID });
            }
            if (props.type === "AR") {
                const fileFormat = await file.$get("fileFormat");
                if (!fileFormat) {
                    throw new UserInputError(
                        "This dataset doesn't support AR algorithms"
                    );
                }
            }
            const permissions = Permission.getPermissionsBySessionInfo(sessionInfo);
            if (
                (permissions.includes("USE_BUILTIN_DATASETS") && file.isBuiltIn) ||
                (permissions.includes("USE_OWN_DATASETS") &&
                    sessionInfo &&
                    file.userID === sessionInfo.userID) ||
                permissions.includes("USE_USERS_DATASETS")
            ) {
                return await TaskCreatorFactory.build(
                    props.type,
                    context,
                    props,
                    file,
                    forceCreate
                );
            } else {
                throw new ForbiddenError(
                    "User hasn't permission for creating task with this dataset"
                );
            }
        },
        uploadDataset: async (
            parent,
            { datasetProps, table },
            { models, sessionInfo }
        ) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("USE_OWN_DATASETS")) {
                throw new AuthenticationError(
                    "User must be logged in and have permission USE_OWN_DATASETS"
                );
            }
            return await models.FileInfo.uploadDataset(
                datasetProps,
                table,
                sessionInfo.userID
            );
        },
        deleteTask: async (
            parent,
            { taskID, safeDelete },
            { models, logger, sessionInfo }
        ) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            const taskInfo = await models.TaskState.findByPk(taskID);
            if (!taskInfo) {
                throw new UserInputError("Task not found");
            }
            if (
                sessionInfo.permissions.includes("MANAGE_USERS_SESSIONS") ||
                taskInfo.userID === sessionInfo.userID
            ) {
                await taskInfo.fullDestroy(!safeDelete);
                logger(
                    `Task ${taskID} was deleted by ${sessionInfo.userID}` +
                        `with safeDelete = ${safeDelete}`
                );
                return { message: `Task with ID = ${taskID} was destroyed` };
            }
            logger(
                `User ${sessionInfo.userID} tries to delete ` +
                    `task someone else's task ${taskInfo.userID}`
            );
            throw new AuthenticationError(
                "User doesn't have permission to delete this task"
            );
        },
    },
};
