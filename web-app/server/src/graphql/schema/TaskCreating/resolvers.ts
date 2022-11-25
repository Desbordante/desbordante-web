import { GraphQLError } from "graphql";
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
                throw new GraphQLError(
                    "User hasn't permission for creating task with this dataset",
                    {
                        extensions: { code: "ForbiddenError" },
                    }
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
                throw new GraphQLError("File not found", {
                    extensions: { code: "UserInputError", fileID },
                });
            }
            if (props.type === "AR") {
                const fileFormat = await file.$get("fileFormat");
                if (!fileFormat) {
                    throw new GraphQLError("This dataset doesn't support AR algorithms", {
                        extensions: { code: "UserInputError", fileID },
                    });
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
                throw new GraphQLError(
                    "User hasn't permission for creating task with this dataset",
                    {
                        extensions: { code: "ForbiddenError" },
                    }
                );
            }
        },
        uploadDataset: async (
            parent,
            { datasetProps, table },
            { models, sessionInfo }
        ) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("USE_OWN_DATASETS")) {
                throw new GraphQLError(
                    "User must be logged in and have permission USE_OWN_DATASETS",
                    {
                        extensions: { code: "AuthenticationError" },
                    }
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
                throw new GraphQLError("User must be authorized", {
                    extensions: { code: "AuthenticationError" },
                });
            }
            const taskInfo = await models.TaskState.findByPk(taskID);
            if (!taskInfo) {
                throw new GraphQLError("Task not found", {
                    extensions: { code: "UserInputError" },
                });
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
            throw new GraphQLError("User doesn't have permission to delete this task", {
                extensions: { code: "AuthenticationError" },
            });
        },
    },
};
