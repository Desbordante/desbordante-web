import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { CsvParserStream, parse } from "fast-csv";
import { Row } from "@fast-csv/parse";
import fs from "fs";
import { InternalServerError } from "http-errors";
import { Op } from "sequelize";
import validator from "validator";

import { Resolvers } from "../../types/types";
import isUUID = validator.isUUID;


const resolvers: Resolvers = {
    TaskData: {
        // @ts-ignore
        __resolveType({ type }, { models, logger }, info) {
            switch (type) {
                 case "FD":
                    return "FDTask";
                 case "CFD":
                     return "CFDTask";
                 default:
                     return null;
            }
        },
    },
    CFD: {
        lhs: (parent, obj, context) => {
            // @ts-ignore
            return parent.l;
        },
        rhs: (parent, obj, context) => {
            // @ts-ignore
            return parent.r;
        },
        lhsPatterns: (parent, obj, context) => {
            // @ts-ignore
            return parent.lp;
        },
        rhsPattern: (parent, obj, context) => {
            // @ts-ignore
            return parent.rp;
        },
    },
    FDTaskConfig: {
        // @ts-ignore
        baseConfig: async({ taskID }, __, { models, logger }) => {
            return await models.BaseTaskConfig.findByPk(taskID);
        },
    },
    CFDTaskConfig: {
        // @ts-ignore
        baseConfig: async({ taskID }, __, { models, logger }) => {
            return await models.BaseTaskConfig.findByPk(taskID);
        },
    },
    TaskInfo: {
        // @ts-ignore
        data: async ({ taskID }, _, { models, logger }) => {
            return await models.BaseTaskConfig.findByPk(taskID,
                { attributes: ["type", "taskID", "fileID"] });
        },
        // @ts-ignore
        state: async ({ taskID }, _, { models, logger }) => {
            return await models.TaskInfo.findByPk(taskID);
        },
        // @ts-ignore
        dataset: async ({ taskID, fileID }, _, { models, logger }) => {
            return { fileID };
        },
    },
    FDTask: {
        // @ts-ignore
        result: async (parent, _, { models, logger }) => {
            // @ts-ignore
            const { taskID } = parent;
            const taskInfo = await models.TaskInfo.findByPk(taskID,
                { attributes: ["isExecuted"] });
            if (!taskInfo) {
                throw new ApolloError("Task not found");
            }
            return taskInfo.isExecuted ? parent : null;
        },
        // @ts-ignore
        config: async ({ taskID }, _, { models, logger }) => {
            return await models.FDTaskConfig.findByPk(taskID);
        },
    },
    CFDTask: {
        // @ts-ignore
        result: async (parent, _, { models, logger }) => {
            // @ts-ignore
            const { taskID } = parent;
            const taskInfo = await models.TaskInfo.findByPk(taskID,
                { attributes: ["isExecuted"] });
            if (!taskInfo) {
                throw new ApolloError("Task not found");
            }
            return taskInfo.isExecuted ? parent : null;
        },
        // @ts-ignore
        config: async ({ taskID }, _, { models, logger }) => {
            return await models.CFDTaskConfig.findByPk(taskID);
        },
    },
    FDResult: {
        // @ts-ignore
        FDs: async ({ taskID }, _, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["FDs"] });
            if (!result) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            return JSON.parse(result.FDs || "[]");
        },
        // @ts-ignore
        PKs: async ({ taskID, fileID }, _, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["PKColumnIndices"] });
            if (!result) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            const indices: number[] = JSON.parse(result.PKColumnIndices || "[]");
            const file = await models.FileInfo.findByPk(
                fileID, { attributes: ["renamedHeader"] }
            );
            if (!file) {
                throw new UserInputError("Invalid fileID was provided", { fileID });
            }
            const columnNames = JSON.parse(file.renamedHeader);
            return indices.map((index) => ({ index, name: columnNames[index] }));
        },
        // @ts-ignore
        pieChartData: async ({ taskID, fileID }, obj, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["pieChartData"] });

            if (!result) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            const { pieChartData } = result;
            if (!pieChartData) {
                return new ApolloError("Attribute `pieChartData` wasn't founded in DB");
            }

            type itemType = { idx: number, value: number };
            // TODO: CHECK pieChartData
            const { lhs, rhs } : { lhs: [itemType], rhs: [itemType] }
                = JSON.parse(pieChartData);

            const file = await models.FileInfo.findByPk(
                fileID, { attributes: ["renamedHeader"] });
            if (!file) {
                throw new UserInputError("Invalid fileID was provided", { fileID });
            }
            const columnNames = JSON.parse(file.renamedHeader);

            const transform = ({ idx, value } : itemType) => (
                { column: { index: idx, name: columnNames[idx] }, value });

            return { lhs: lhs.map(transform), rhs: rhs.map(transform) };
        },
    },
    CFDPieCharts: {
        // @ts-ignore
        withoutPatterns: async({ columnNames, fileID, taskID }, _, { models, logger }) => {
            const result = await models.CFDTaskResult.findByPk(taskID, { attributes: ["withoutPatterns"] });
            if (!result) {
                throw new ApolloError("Result not found");
            }
            const { withoutPatterns } = result;
            type withoutPatternsRow = { id: number, value: string };
            const withoutPatternsObject: { lhs: [withoutPatternsRow], rhs: [withoutPatternsRow] } = JSON.parse(withoutPatterns);
            const transform = ({ id, value }: withoutPatternsRow) => ({
                column: { index: id, name: columnNames[id] },
                value,
            });
            return { lhs: withoutPatternsObject.lhs.map(transform), rhs: withoutPatternsObject.rhs.map(transform) };
        },
        // @ts-ignore
        withPatterns: async({ columnNames, fileID, taskID }, _, { models, logger }) => {
            const result = await models.CFDTaskResult.findByPk(taskID, { attributes: ["withPatterns"] });
            if (!result) {
                throw new ApolloError("Result not found");
            }
            const { withPatterns } = result;
            type withPatternsRow = { id: number, value: string, pattern: string };
            const withPatternsObject: { lhs: [withPatternsRow], rhs: [withPatternsRow] } = JSON.parse(withPatterns);
            const transform = ({ id, value, pattern }: withPatternsRow) => ({
                column: { index: id, name: columnNames[id] },
                value,
                pattern,
            });
            return { lhs: withPatternsObject.lhs.map(transform), rhs: withPatternsObject.rhs.map(transform) };
        },
    },
    CFDResult: {
        // @ts-ignore
        CFDs: async ({ taskID }, _, { models, logger }) => {
            const result = await models.CFDTaskResult.findByPk(
                taskID, { attributes: ["CFDs"] });
            if (!result) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            return JSON.parse(result.CFDs || "[]");
        },
        // @ts-ignore
        pieChartData: async ({ taskID, fileID }, obj, { models, logger }) => {
            const file = await models.FileInfo.findByPk(
                fileID, { attributes: ["renamedHeader"] });
            if (!file) {
                throw new UserInputError("Invalid fileID was provided", { fileID });
            }
            const columnNames: string[] = JSON.parse(file.renamedHeader);
            return { fileID, columnNames, taskID };
        },
    },
    DatasetInfo: {
        // Todo: refactor (add params for field snippet && add resolvers for type Snippet)
        // @ts-ignore
        snippet: async ({ fileID }, { offset, limit }, { models, logger, sessionInfo }) => {
            if (!fileID) {
                throw new ApolloError("received null fileID");
            }
            if (limit < 0) {
                throw new UserInputError("Received incorrect limit");
            }
            const fileInfo = await models.FileInfo.findByPk(fileID,
                { attributes: ["path", "delimiter", "hasHeader", "renamedHeader"] });
            if (!fileInfo) {
                throw new InternalServerError(`Incorrect fileID = '${fileID}' was provided`);
            }
            const { path, delimiter, hasHeader, renamedHeader } = fileInfo;
            if (limit === 0) {
                return { rows: null, header: JSON.parse(renamedHeader), fileID };
            }
            const rows: string[][] = [];
            if (hasHeader) {
                offset += 1;
            }

            return await new Promise(resolve => {
                const parser: CsvParserStream<Row, Row> = parse({
                    delimiter,
                    skipRows: offset,
                    maxRows: limit,
                });

                fs.createReadStream(path!)
                    .pipe(parser)
                    .on("error", (e) => {
                        throw new ApolloError(`ERROR WHILE READING FILE:\n\r${e.message}`);
                    })
                    .on("data", (row) => {
                        rows.push(row);
                    })
                    .on("end", () => {
                        // @ts-ignore
                        resolve({ rows, header: JSON.parse(renamedHeader), fileID });
                    });
            });
        },
        // @ts-ignore
        tableInfo: async({ fileID }, args, { models, logger }) => {
            return models.FileInfo.findByPk(fileID);
        },
        // @ts-ignore
        tasks: async({ fileID }, { filter }, { models, logger }) => {
            const { includeExecutedTasks, includeCurrentTasks,
                includeTasksWithError, includeTasksWithoutError } = filter;
            let where = {};
            if (!includeExecutedTasks && ! includeCurrentTasks
                || !includeTasksWithoutError && !includeTasksWithError) {
                throw new UserInputError("INVALID INPUT");
            }
            if (includeExecutedTasks !== includeCurrentTasks) {
                where = { ...where, isExecuted: includeExecutedTasks };
            }
            if (includeTasksWithError !== includeTasksWithoutError) {
                where = {
                    ...where,
                    errorMsg: { [includeTasksWithError ? Op.not : Op.is]: null },
                };
            }
            return await models.TaskInfo.findAll({ where });
        },
    },

    Query: {
        datasetInfo: async (parent, { fileID }, { models, logger, sessionInfo }) => {
            if (!isUUID(fileID, 4)) {
                throw new UserInputError("Invalid fileID was provided");
            }
            const fileInfo = await models.FileInfo.findByPk(fileID);
            if (!fileInfo) {
                throw new UserInputError("File not found");
            }
            if (fileInfo.isBuiltIn
                || sessionInfo && sessionInfo.userID === fileInfo.userID
                || sessionInfo && sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                return { fileID };
            }
            throw new ForbiddenError("You don't have access");
        },
        taskInfo: async (parent, { taskID }, { models, logger, sessionInfo }) => {
            if (!isUUID(taskID, 4)) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            const taskConfig = await models.BaseTaskConfig.findByPk(taskID,
                { attributes: ["taskID", "fileID", "type"] });
            const taskInfo = await models.TaskInfo.findByPk(taskID,
                { attributes: ["userID", "isPrivate"] });
            if (!taskConfig || !taskInfo) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            const fileInfo = await models.FileInfo.findByPk(taskConfig.fileID,
                { attributes: ["isBuiltIn", "userID"] });
            if (!fileInfo) {
                throw new UserInputError("Incorrect task info was provided");
            }
            if (!taskInfo.userID || sessionInfo && sessionInfo.userID === taskInfo.userID
                || sessionInfo && !taskInfo.isPrivate
                || sessionInfo && sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                return taskConfig;
            }
            throw new ForbiddenError("User doesn't have permissions");
        },
    },

    Mutation: {
        changeTaskResultsPrivacy: async (parent, { isPrivate, taskID }, { models, logger, sessionInfo }) => {
            if (!isUUID(taskID, 4)) {
                throw new UserInputError("Incorrect taskID was provided", { taskID });
            }
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            const taskInfo = await models.TaskInfo.findByPk(taskID);
            if (!taskInfo) {
                throw new UserInputError("Task not found", { taskID });
            }
            if (!taskInfo.userID) {
                throw new UserInputError("Tasks, created by anonymous, can't be private");
            }

            if (sessionInfo.permissions.includes("MANAGE_USERS_SESSIONS")
                || sessionInfo.userID === taskInfo.userID) {
                return await taskInfo.update({ isPrivate });
            } else {
                throw new AuthenticationError("You don't have permission");
            }
        },
    },
};

export default resolvers;
