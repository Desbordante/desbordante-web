import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { CsvParserStream, parse } from "fast-csv";
import { Row } from "@fast-csv/parse";
import fs from "fs";
import { FindOptions, Op } from "sequelize";
import validator from "validator";

import { Pagination, PrimitiveType, Resolvers } from "../../types/types";
import { TaskInfo, TaskStatusType } from "../../../db/models/TaskData/TaskInfo";
import { builtInDatasets } from "../../../db/initBuiltInDatasets";
import { BaseTaskConfig } from "../../../db/models/TaskData/BaseTaskConfig";
import isUUID = validator.isUUID;

function getArrayOfDepsByPagination<DependencyType> (deps: DependencyType[],
                                                     pagination: Pagination) {
    const { limit, offset } = pagination;
    if (limit < 1 || limit > 300 || offset < 0) {
        throw new UserInputError(
            "Limit must have value between 1 and 300, offset can't be negative", { pagination });
    }
    const from = offset;
    const to = from + limit;
    return deps.slice(from, to);
}

export const TaskInfoResolvers: Resolvers = {
    PrimitiveTaskResult: {
        // @ts-ignore
        __resolveType: ({ propertyPrefix }) => `${propertyPrefix}TaskResult`,
    },
    PrimitiveTaskConfig: {
        // @ts-ignore
        __resolveType: ({ propertyPrefix }) => `${propertyPrefix}TaskConfig`,
    },
    CFD: {
        // @ts-ignore
        lhs: parent => parent.l,
        // @ts-ignore
        rhs: parent => parent.r,
        // @ts-ignore
        lhsPatterns: parent => parent.lp,
        // @ts-ignore
        rhsPattern: parent => parent.rp,
    },
    FD: {
        // @ts-ignore
        lhs: ({ dep, columnNames }: { dep: [ string[], string ], columnNames: string[] }) => {
            return dep[0].map(i => columnNames[Number(i)]);
        },
        // @ts-ignore
        rhs: ({ dep, columnNames }: { dep: [ string[], string ] }) => {
            // @ts-ignore
            return columnNames[dep[1]];
        },
    },
    AR: {
        // @ts-ignore
        lhs: ({ rule, valueDictionary }) => {
            // @ts-ignore
            return rule[1].split(",").map(i => valueDictionary[i]);
        },
        // @ts-ignore
        rhs: ({ rule, valueDictionary }) => {
            // @ts-ignore
            return rule[2].split(",").map(i => valueDictionary[i]);
        },
        // @ts-ignore
        support: ({ rule }) => {
            return rule[0];
        },
    },
    TaskStateAnswer: {
        // @ts-ignore
        __resolveType: ({ status } : { status: TaskStatusType }) => {
            if (status == "INTERNAL_SERVER_ERROR") {
                return "InternalServerTaskError";
            } else if(status == "RESOURCE_LIMIT_IS_REACHED") {
                return "ResourceLimitTaskError";
            }
            return "TaskState";
        },
    },
    InternalServerTaskError: {
        // @ts-ignore
        internalError: ({ errorMsg }, _, { sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                return null;
            }
            return errorMsg;
        },
        // @ts-ignore
        errorStatus: ({ status }) => status,
    },
    ResourceLimitTaskError: {
        // @ts-ignore
        resourceLimitError: ({ errorMsg }) => errorMsg,
        // @ts-ignore
        errorStatus: ({ status }) => status,
    },
    TaskState: {
        // @ts-ignore
        processStatus: ({ status }) => status,
    },
    TaskInfo: {
        // @ts-ignore
        data: async (parent) => parent,
        // @ts-ignore
        state: async ({ taskID }, _, { models }) => {
            return await models.TaskInfo.findByPk(taskID);
        },
        // @ts-ignore
        dataset: async ({ fileID  }, _, { models }) => {
            return models.FileInfo.findByPk(fileID);
        },
    },
    PrimitiveTaskData: {
        // @ts-ignore
        result: async ({ taskID, propertyPrefix, fileID }, _, { models }) => {
            const taskInfo = await models.TaskInfo.findByPk(taskID,
                { attributes: ["taskID", "isExecuted"] });
            if (!taskInfo) {
                throw new ApolloError("Task not found");
            }
            if (!taskInfo.isExecuted) {
                return null;
            }
            return { taskInfo, propertyPrefix, fileID, taskID };
        },
        // @ts-ignore
        specificConfig: async ({ propertyPrefix, taskID, fileID } : { propertyPrefix: PrimitiveType, taskID: string, fileID: string }, _, { models }) => {
            const taskInfo = await models.TaskInfo.findByPk(taskID, { attributes: ["taskID"] });
            if (!taskInfo) {
                throw new ApolloError("TaskInfo not found");
            }
            const specificConfig = await taskInfo.$get(`${propertyPrefix}Config`, { raw: true });
            if (!specificConfig) {
                throw new ApolloError(`${propertyPrefix}Config not found`);
            }
            return { ...specificConfig, fileID, propertyPrefix };
        },
        // @ts-ignore
        baseConfig: async ({ taskID }, __, { models }) =>
            await models.BaseTaskConfig.findByPk(taskID),
    },
    FDTaskResult: {
        // @ts-ignore
        FDs: async ({ propertyPrefix, taskInfo, fileID } : { propertyPrefix: PrimitiveType, taskInfo: TaskInfo }, { pagination }, { models, logger }) => {
            const FDs = await taskInfo.getSingleResultFieldAsString(propertyPrefix, "FDs");
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const compactFDs = FDs.split(";")
                .map(unionIndices => unionIndices.split(","))
                .map(depIndices => ({ dep: [ depIndices.slice(0, depIndices.length - 1), depIndices[depIndices.length - 1] ], columnNames }));
            return getArrayOfDepsByPagination(compactFDs, pagination);
        },
        // @ts-ignore
        PKs: async ({ propertyPrefix, taskInfo, fileID }, _, { models }) => {
            const keysString = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "PKColumnIndices");
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            if (!keysString) {
                return [];
            }
            return keysString.split(",").map((index) => ({ index, name: columnNames[index] }));
        },
        // @ts-ignore
        pieChartData: async ({ propertyPrefix, taskInfo, fileID }, obj, { models }) => {
            const pieChartData = await taskInfo.getSingleResultFieldAsString(propertyPrefix, "pieChartData");
            const [lhs, rhs] = pieChartData.split("|");

            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const transformFromCompactData = (data: string) => {
                return data.split(";")
                    .map((keyValueStr: string) => keyValueStr.split(","))
                    .map(([index, value]) => ({ column: { index, name: columnNames[index] }, value }));
            };

            return { lhs: transformFromCompactData(lhs), rhs: transformFromCompactData(rhs) };
        },
    },
    ARTaskConfig: {
        // @ts-ignore
        fileFormat: async ({ fileID }, _, { models }) => {
            return await models.FileFormat.findByPk(fileID);
        },
    },
    ARTaskResult: {
        // @ts-ignore
        ARs: async ({ propertyPrefix, taskInfo }, { pagination }) => {
            const ARs = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "ARs");
            const valueDictionary = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "valueDictionary");
            const compactARs = ARs.split(";").map(compactAR => ({ rule: compactAR.split(":"), valueDictionary: valueDictionary.split(",") }));
            return getArrayOfDepsByPagination(compactARs, pagination);
        },
    },
    CFDPieCharts: {
        // @ts-ignore
        withoutPatterns: async ({ propertyPrefix, taskInfo, columnNames }) => {
            const withoutPatterns = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "withoutPatterns");

            type withoutPatternsRow = { id: number, value: string };
            const withoutPatternsObject: { lhs: [withoutPatternsRow], rhs: [withoutPatternsRow] } = JSON.parse(withoutPatterns);
            const transform = ({ id, value }: withoutPatternsRow) => ({ column: { index: id, name: columnNames[id] }, value });
            return { lhs: withoutPatternsObject.lhs.map(transform), rhs: withoutPatternsObject.rhs.map(transform) };
        },
        // @ts-ignore
        withPatterns: async ({ propertyPrefix, taskInfo, columnNames }) => {
            const withPatterns = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "withPatterns");

            type withPatternsRow = { id: number, value: string, pattern: string };
            const withPatternsObject: { lhs: [withPatternsRow], rhs: [withPatternsRow] } = JSON.parse(withPatterns);
            const transform = ({ id, value, pattern }: withPatternsRow) => ({ column: { index: id, name: columnNames[id] }, value, pattern });
            return { lhs: withPatternsObject.lhs.map(transform), rhs: withPatternsObject.rhs.map(transform) };
        },
    },
    CFDTaskResult: {
        // @ts-ignore
        CFDs: async ({ propertyPrefix, taskInfo }, { pagination }) => {
            const CFDsStr = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "CFDs");
            const CFDs = JSON.parse(CFDsStr);
            return getArrayOfDepsByPagination(CFDs, pagination);
        },
        // @ts-ignore
        pieChartData: async ({ propertyPrefix, taskInfo, fileID }, _, { models }) => {
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            return { propertyPrefix, taskInfo, fileID, columnNames };
        },
        // @ts-ignore
        PKs: async ({ propertyPrefix, taskInfo, fileID }, _, { models, logger }) => {
            const PKColumnIndices = await (taskInfo as TaskInfo).getSingleResultFieldAsString(propertyPrefix, "PKColumnIndices");
            const indices: number[] = JSON.parse(PKColumnIndices);
            logger(PKColumnIndices);
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            return indices.map(index => ({ index, name: columnNames[index] }));
        },
    },
    FileFormat: {
        // @ts-ignore
        dataset: async ({ fileID }, obj, { models }) => {
            if (!fileID) {
                throw new ApolloError("fileID wasn't provided");
            }
            return models.FileInfo.findByPk(fileID);
        },
    },
    Snippet: {
        // @ts-ignore
        rows: async ({ hasHeader, delimiter, path, rowsCount }, { pagination }) => {
            const { offset, limit } = pagination;
            if (offset === undefined || limit === undefined) {
                throw new UserInputError("User must provide offset and limit");
            }
            if (limit < 0 || limit > 200) {
                throw new UserInputError("Received incorrect limit", { limit });
            }
            if (limit === 0) {
                return [];
            }
            if (rowsCount === undefined) {
                throw new ApolloError("RowsCount is undefined");
            }
            if (offset > rowsCount || offset < 0 ) {
                throw new UserInputError(`Offset must be more than 0 and less, then rowsCount = ${rowsCount}`);
            }

            const rows: string[][] = [];

            return new Promise(resolve => {
                const parser: CsvParserStream<Row, Row> = parse({
                    delimiter,
                    skipRows: offset + hasHeader,
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
                        resolve(rows);
                    });
            });
        },
        // @ts-ignore
        header: async ({ fileID }, _, { models }) => {
            return await models.FileInfo.getColumnNamesForFile(fileID);
        },
        // @ts-ignore
        datasetInfo: async ({ fileID }, _, { models }) => {
            return await models.FileInfo.findByPk(fileID);
        },
    },
    DatasetInfo: {
        // @ts-ignore
        snippet: async ({ fileID } ,_, { models }) => {
            if (!fileID) {
                throw new ApolloError("received null fileID");
            }
            const fileInfo = await models.FileInfo.findByPk(fileID,
                { attributes: ["fileID", "path", "delimiter", "hasHeader", "rowsCount"] });
            if (!fileInfo) {
                throw new UserInputError(`Incorrect fileID = '${fileID}' was provided`);
            }
            return fileInfo;
        },
        // @ts-ignore
        tasks: async ({ fileID }, { filter }, { models }) => {
            const { includeExecutedTasks, includeCurrentTasks,
                includeTasksWithError, includeTasksWithoutError, includeDeletedTasks } = filter;
            let where: any = { fileID };
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
            const options: FindOptions<BaseTaskConfig> = { attributes: ["taskID", "fileID", ["type", "propertyPrefix"]], raw: true, where };
            if (includeDeletedTasks) {
                options.paranoid = false;
            }
            return await models.BaseTaskConfig.findAll(options);
        },
        // @ts-ignore
        supportedPrimitives: async ({ fileID, isBuiltIn, fileName }, obj, { models }) => {
            if (isBuiltIn === true) {
                const dataset = builtInDatasets.find(info => info.fileName === fileName);
                if (!dataset) {
                    throw new ApolloError("Built in dataset info not found");
                } else {
                    return dataset.supportedPrimitives;
                }
            }
            const fileFormat = await models.FileFormat.findByPk(fileID);
            if (!fileFormat) {
                return ["FD", "CFD"];
            } else {
                return ["AR", "FD", "CFD"];
            }
        },
        // @ts-ignore
        fileFormat: async ({ fileID }, obj, { models }) => {
            return await models.FileFormat.findByPk(fileID);
        },
        // @ts-ignore
        header: async ({ fileID }, obj, { models }) => {
            if (!fileID) {
                throw new ApolloError("Undefined fileID");
            }
            return await models.FileInfo.getColumnNamesForFile(fileID);
        },
    },
    Query: {
        // @ts-ignore
        datasetInfo: async (parent, { fileID }, { models, sessionInfo }) => {
            if (!isUUID(fileID, 4)) {
                throw new UserInputError("Invalid fileID was provided");
            }
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new UserInputError("File not found");
            }
            if (file.isBuiltIn
                || sessionInfo && sessionInfo.userID === file.userID
                || sessionInfo && sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                return file;
            }
            throw new ForbiddenError("You don't have access");
        },
        taskInfo: async (parent, { taskID }, { models, sessionInfo }) => {
            if (!isUUID(taskID, 4)) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            const taskConfig = await models.BaseTaskConfig.findByPk(taskID,
                { attributes: ["taskID", "fileID", ["type", "propertyPrefix"]], raw: true });
            const taskInfo = await models.TaskInfo.findByPk(taskID,
                { attributes: ["userID", "isPrivate"] });
            if (!taskConfig || !taskInfo) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            if (!taskInfo.userID || sessionInfo && sessionInfo.userID === taskInfo.userID
                || sessionInfo && !taskInfo.isPrivate
                || sessionInfo && sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                return taskConfig;
            }
            throw new ForbiddenError("User doesn't have permissions");
        },
        // @ts-ignore
        tasksInfo: async (parent, { pagination }, { models, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                return new AuthenticationError("User doesn't have permissions");
            }
            return models.BaseTaskConfig.findAll(
                { ...pagination, attributes: ["taskID", "fileID", ["type", "propertyPrefix"]], raw: true });
        },
    },

    Mutation: {
        changeTaskResultsPrivacy: async (parent, { isPrivate, taskID }, { models, sessionInfo }) => {
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
