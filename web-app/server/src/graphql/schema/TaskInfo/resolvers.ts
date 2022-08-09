import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { CsvParserStream, parse } from "fast-csv";
import { FindOptions, Op } from "sequelize";
import {
    GeneralTaskConfig,
    MainPrimitiveType,
    SPECIFIC_TASKS,
    isSpecificPrimitiveType,
} from "../../../db/models/TaskData/configs/GeneralTaskConfig";
import { Resolvers, TaskProcessStatusType } from "../../types/types";
import { applyPagination, resolverCannotBeCalled, returnParent } from "../../util";
import { AbstractFilter } from "./DependencyFilters/AbstractFilter";
import { AuthenticationError } from "apollo-server-express";
import { CompactData } from "./DependencyFilters/CompactData";
import { FDFilter } from "./DependencyFilters/FDFilter";
import { Row } from "@fast-csv/parse";
import { builtInDatasets } from "../../../db/initBuiltInDatasets";
import fs from "fs";
import { getSpecificFilter } from "./DependencyFilters";
import validator from "validator";

import isUUID = validator.isUUID;

export const TaskInfoResolvers: Resolvers = {
    TaskWithDepsResult: {
        __resolveType: ({ prefix }) => `${prefix}TaskResult`,
        depsAmount: async ({ prefix, state }) =>
            await state.getResultField(prefix, "depsAmount"),
        filteredDeps: async ({ state, prefix, fileID }, { filter }, context) => {
            const deps = await state.getResultFieldAsString(prefix, "deps");
            const params = [filter, fileID, prefix, state, context] as const;
            const specificFilter = await getSpecificFilter(prefix, [...params]);
            const depsInfo = await specificFilter.getFilteredTransformedDeps(deps);
            return { prefix, ...depsInfo };
        },
    },
    SpecificTaskResult: {
        __resolveType: ({ prefix }) => `${prefix}TaskResult`,
    },
    FilteredDepsBase: {
        __resolveType: ({ prefix }) =>
            `Filtered${AbstractFilter.getRealPrimitiveType(prefix)}s`,
    },
    PrimitiveTaskConfig: {
        __resolveType: ({ prefix }) => `${prefix}TaskConfig`,
    },
    TaskStateAnswer: {
        __resolveType: ({ status }) => {
            switch (status) {
                case "INTERNAL_SERVER_ERROR":
                    return "InternalServerTaskError";
                case "RESOURCE_LIMIT_IS_REACHED":
                    return "ResourceLimitTaskError";
                default:
                    return "TaskState";
            }
        },
    },
    InternalServerTaskError: {
        internalError: ({ errorMsg }, _, { sessionInfo }) =>
            sessionInfo?.permissions.includes("VIEW_ADMIN_INFO") ? errorMsg : null,
        errorStatus: ({ status }) => status,
    },
    ResourceLimitTaskError: {
        resourceLimitError: ({ errorMsg }) => errorMsg,
        errorStatus: ({ status }) => status,
    },
    TaskState: {
        processStatus: ({ status }) => status as TaskProcessStatusType,
    },
    AbstractTaskInfo: {
        __resolveType: ({ prefix }) => {
            const answer = SPECIFIC_TASKS.includes(prefix)
                ? "SpecificTaskInfo"
                : "TaskInfo";
            return answer;
        },
        state: async ({ taskID }, _, { models }) => {
            const state = await models.TaskState.findByPk(taskID);
            if (!state) {
                throw new ApolloError("Task state not found");
            }
            return state;
        },
        data: returnParent,
        dataset: async ({ fileID }, _, { models }) => {
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new ApolloError("File not found");
            }
            return file;
        },
    },
    AbstractTaskData: {
        __resolveType: ({ prefix }) =>
            prefix === "TypoCluster" ? "TaskWithDepsData" : "SpecificTaskData",
        specificConfig: async ({ prefix, taskID, fileID }, _, { models }) => {
            const state = await models.TaskState.findByPk(taskID, {
                attributes: ["taskID"],
            });
            if (!state) {
                throw new ApolloError("TaskInfo not found");
            }
            const specificConfig = await state.$get(`${prefix}Config`, {
                raw: true,
            });
            if (!specificConfig) {
                throw new ApolloError(`${prefix}Config not found`);
            }
            return { ...specificConfig, fileID, prefix };
        },
        baseConfig: async ({ taskID }, __, { models }) => {
            const baseConfig = await models.GeneralTaskConfig.findByPk(taskID);
            if (!baseConfig) {
                throw new ApolloError("Base config not found");
            }
            return baseConfig;
        },
    },
    TaskWithDepsData: {
        result: async (parent, _, { models }) => {
            const { taskID } = parent;
            const state = await models.TaskState.getTaskState(taskID);
            return state.isExecuted ? { state, ...parent } : null;
        },
    },
    SpecificTaskData: {
        result: async ({ prefix, ...rest }, _, { models }) => {
            if (!isSpecificPrimitiveType(prefix)) {
                throw new ApolloError(
                    `Resolver incorrect TaskData type, expected SpecificTaskData. [${prefix}]`
                );
            }
            const { taskID } = rest;
            const state = await models.TaskState.getTaskState(taskID);
            return state.isExecuted ? { state, prefix, ...rest } : null;
        },
    },
    ResultsWithPKs: {
        __resolveType: resolverCannotBeCalled,
        PKs: async ({ prefix, state, fileID }, __, { models }) => {
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const PKsIndices = await FDFilter.getPKsIndices(state, prefix);
            return PKsIndices.map((index) => ({ index, name: columnNames[index] }));
        },
    },
    PieChartDataBase: {
        __resolveType: resolverCannotBeCalled,
        withoutPatterns: async ({ prefix: type, state, fileID }) =>
            CompactData.toPieChartWithoutPattern(
                await state.getResultFieldAsString(type, "withoutPatterns"),
                await AbstractFilter.getColumnsInfo(fileID)
            ),
    },
    CFDPieChartData: {
        withPatterns: async ({ prefix: type, state, fileID }) =>
            CompactData.toPieChartWithPattern(
                await state.getResultFieldAsString(type, "withPatterns"),
                await AbstractFilter.getColumnsInfo(fileID),
                await AbstractFilter.getItemsInfo(state, type)
            ),
    },
    FDTaskResult: {
        pieChartData: returnParent,
    },
    TypoClusterTaskConfig: {
        typoFD: async ({ fileID, typoFD }) =>
            CompactData.toFD(
                CompactData.toCompactFD(typoFD),
                await AbstractFilter.getColumnsInfo(fileID)
            ),
    },
    ARTaskConfig: {
        fileFormat: async ({ fileID }, _, { models }) => {
            const fileFormat = await models.FileFormat.findByPk(fileID);
            if (!fileFormat) {
                throw new ApolloError("fileFormat for AR file not found");
            }
            return fileFormat;
        },
    },
    ClusterBase: {
        __resolveType: ({ clusterInfo }) => {
            return clusterInfo.squashed ? "SquashedCluster" : "Cluster";
        },
        clusterID: ({ clusterID }) => clusterID,
        itemsAmount: ({ clusterInfo }) => {
            if (clusterInfo.squashed === "true") {
                return clusterInfo.rowIndicesWithAmount.length;
            } else {
                return clusterInfo.rowIndices.length;
            }
        },
    },
    Cluster: {
        items: async ({ rows, clusterInfo }, { pagination }) => {
            const { suspiciousIndices, rowIndices } = clusterInfo;
            const items = rowIndices.map((rowIndex) => {
                const row = rows.get(rowIndex);
                if (!row) {
                    throw new ApolloError("Row not found");
                }
                return {
                    row,
                    rowIndex,
                    isSuspicious: suspiciousIndices.has(rowIndex),
                };
            });
            return applyPagination(items, pagination);
        },
    },
    SquashedCluster: {
        items: async ({ rows, clusterInfo }, { pagination }) => {
            const { rowIndicesWithAmount } = clusterInfo;
            const items = rowIndicesWithAmount.map(({ rowIndex, amount }) => {
                const row = rows.get(rowIndex);
                if (!row) {
                    throw new ApolloError("Row not found");
                }
                return { row, rowIndex, amount };
            });
            return applyPagination(items, pagination);
        },
    },
    SpecificClusterOrState: {
        __resolveType: (parent) => {
            if ("state" in parent) {
                return "TaskState";
            } else if ("errorMsg" in parent) {
                return "InternalServerTaskError";
            } else {
                const { squashed } = parent.clusterInfo;
                return `${squashed ? "Squashed" : ""}Cluster`;
            }
        },
    },
    TypoClusterTaskResult: {
        typoClusters: async ({ prefix, state, fileID }, { pagination }, { models }) => {
            const [typoClustersStr, suspiciousIndicesStr] =
                await state.getResultFieldsAsString(prefix, [
                    "TypoClusters",
                    "suspiciousIndices",
                ]);
            if (!typoClustersStr) {
                return [];
            }
            const clustersSuspiciousIndicesData = applyPagination(
                suspiciousIndicesStr.split(";"),
                pagination
            );
            const clustersRowIndicesData = applyPagination(
                typoClustersStr.split(";"),
                pagination
            );
            const clustersData = clustersSuspiciousIndicesData.map(
                (suspiciousIndices, id) =>
                    CompactData.toClusterWithSuspiciousIndices(
                        suspiciousIndices,
                        clustersRowIndicesData[id]
                    )
            );

            let indices: number[] = [];
            for (const { rowIndices } of clustersData) {
                indices = [...new Set([...indices, ...rowIndices])];
            }
            if (fileID == undefined) {
                const typoTaskID = await state.getSingleConfigFieldAsString(
                    prefix,
                    "typoTaskID"
                );
                const typoTaskConfig = await models.GeneralTaskConfig.findByPk(
                    typoTaskID,
                    { attributes: ["fileID"] }
                );
                if (!typoTaskConfig) {
                    throw new ApolloError("Parent task config not found");
                }
                fileID = typoTaskConfig.fileID;
            }

            const file = await models.FileInfo.findByPk(fileID, {
                attributes: ["path", "delimiter", "hasHeader"],
            });
            if (!file) {
                throw new ApolloError("File not found");
            }
            const rows = await models.FileInfo.GetRowsByIndices(file, indices);
            return clustersData.map((clusterData, clusterID) => ({
                clusterInfo: { squashed: "false", ...clusterData },
                clusterID,
                rows,
            }));
        },
        specificCluster: async (
            { state: parentState, prefix, fileID },
            { props },
            { models }
        ) => {
            throw new ApolloError("Not implemented yet");
            // if (!parentState.isExecuted) {
            //     throw new UserInputError("Parent task isn't executed yet");
            // }
            // const { clusterID, sort, squash } = props;
            // create if not exists

            // if on executing --> return state
            // const errorStatuses = ["INTERNAL_SERVER_ERROR", "RESOURCE_LIMIT_IS_REACHED"];
            // if (!state.isExecuted) {
            //     return { state };
            // } else if (errorStatuses.includes(state.status)) {
            //     const { errorMsg } = state;
            //     return { errorMsg: errorMsg || "" };
            // }
            // const clusterAttrName = `${squash ? "" : "not"}Squashed${
            //     sort ? "" : "Not"
            // }SortedCluster` as const;
            //
            // if (!squash) {
            //     const [suspiciousIndicesStr, rowIndicesStr] =
            //         await state.getResultFieldsAsString("SpecificTypoCluster", [
            //             "suspiciousIndices",
            //             clusterAttrName,
            //         ]);
            //     const rowIndices = rowIndicesStr.split(",").map(Number);
            //     const [clusterIDStr, typoClusterTaskID] =
            //         await state.getResultFieldsAsString(prefix, [
            //             "clusterID",
            //             "typoClusterTaskID",
            //         ]);
            //     const suspiciousIndices = suspiciousIndicesStr
            //         .split(";")
            //         .map((data) => new Set(data.split(",").map(Number)))[clusterID];
            //     if (fileID === undefined) {
            //         const typoClusterConfig = await models.TypoClusterConfig.findByPk(
            //             typoClusterTaskID,
            //             { attributes: ["typoTaskID"] }
            //         );
            //         if (!typoClusterConfig) {
            //             throw new ApolloError("Parent task config not found");
            //         }
            //         const { parentTaskID } = typoClusterConfig;
            //         const typoTaskConfig = await models.GeneralTaskConfig.findByPk(
            //             parentTaskID,
            //             { attributes: ["fileID"] }
            //         );
            //         if (!typoTaskConfig) {
            //             throw new ApolloError("Parent task config not found");
            //         }
            //         fileID = typoTaskConfig.fileID;
            //     }
            //
            //     const file = await models.FileInfo.findByPk(fileID, {
            //         attributes: ["path", "delimiter", "hasHeader"],
            //     });
            //     if (!file) {
            //         throw new ApolloError("File not found");
            //     }
            //     const rows = await models.FileInfo.GetRowsByIndices(
            //         file,
            //         Array.from(rowIndices)
            //     );
            //     return {
            //         clusterID,
            //         rows,
            //         clusterInfo: {
            //             squashed: "false",
            //             suspiciousIndices,
            //             rowIndices,
            //         },
            //     };
            // } else {
            //     const squashedCluster = await state.getResultFieldAsString(
            //         prefix,
            //         `squashed${sort ? "" : "Not"}SortedCluster`
            //     );
            //     const rowIndicesWithAmount = squashedCluster
            //         .split(";")
            //         .map((squashedItem) => squashedItem.split(",").map(Number))
            //         .map(([rowIndex, amount]) => ({ rowIndex, amount }));
            //
            //     const [clusterIDStr, typoClusterTaskID] =
            //         await state.getResultFieldsAsString(prefix, [
            //             "clusterID",
            //             "typoClusterTaskID",
            //         ]);
            //     const clusterID = Number(clusterIDStr);
            //     if (fileID == undefined) {
            //         const typoClusterConfig = await models.TypoClusterConfig.findByPk(
            //             typoClusterTaskID,
            //             { attributes: ["typoTaskID"] }
            //         );
            //         if (!typoClusterConfig) {
            //             throw new ApolloError("Parent task config not found");
            //         }
            //         const { parentTaskID } = typoClusterConfig;
            //         const typoTaskConfig = await models.GeneralTaskConfig.findByPk(
            //             parentTaskID,
            //             { attributes: ["fileID"] }
            //         );
            //         if (!typoTaskConfig) {
            //             throw new ApolloError("Parent task config not found");
            //         }
            //         fileID = typoTaskConfig.fileID;
            //     }
            //
            //     const file = await models.FileInfo.findByPk(fileID, {
            //         attributes: ["path", "delimiter", "hasHeader"],
            //     });
            //     if (!file) {
            //         throw new ApolloError("File not found");
            //     }
            //     const rows = await models.FileInfo.GetRowsByIndices(
            //         file,
            //         rowIndicesWithAmount.map(({ rowIndex }) => rowIndex)
            //     );
            //     return {
            //         clusterID,
            //         rows,
            //         clusterInfo: { squashed: "true", rowIndicesWithAmount },
            //     };
            // }
        },
        clustersCount: async ({ prefix, state }) =>
            await state.getResultField(prefix, "clustersCount"),
    },
    CFDTaskResult: {
        pieChartData: returnParent,
    },
    FileFormat: {
        dataset: async ({ fileID }, obj, { models }) => {
            if (!fileID) {
                throw new ApolloError("fileID wasn't provided");
            }
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new ApolloError(`Info about file = ${fileID} not found`);
            }
            return file;
        },
    },
    Snippet: {
        rows: async ({ hasHeader, delimiter, path, rowsCount }, { pagination }) => {
            const { offset, limit } = pagination;
            if (limit < 0 || limit > 200) {
                throw new UserInputError("Received incorrect limit", { limit });
            }
            if (limit === 0) {
                return [];
            }
            if (rowsCount === undefined) {
                throw new ApolloError("RowsCount is undefined");
            }
            if (offset > rowsCount || offset < 0) {
                throw new UserInputError(
                    `Offset must be more than 0 and less, then rowsCount = ${rowsCount}`
                );
            }

            const rows: string[][] = [];

            return new Promise((resolve) => {
                const parser: CsvParserStream<Row, Row> = parse({
                    delimiter,
                    skipRows: offset + Number(hasHeader),
                    maxRows: limit,
                });

                fs.createReadStream(path)
                    .pipe(parser)
                    .on("error", (e) => {
                        throw new ApolloError(
                            `ERROR WHILE READING FILE:\n\r${e.message}`
                        );
                    })
                    .on("data", (row) => {
                        rows.push(row);
                    })
                    .on("end", () => {
                        resolve(rows);
                    });
            });
        },
        header: async ({ fileID, hasHeader }, _, { models }) => {
            const fileFormat = await models.FileFormat.findByPk(fileID, {
                attributes: ["fileID"],
            });
            if (fileFormat && !hasHeader) {
                return null;
            }
            return await models.FileInfo.getColumnNamesForFile(fileID);
        },
        datasetInfo: async ({ fileID }, _, { models }) => {
            if (!fileID) {
                throw new ApolloError("fileID wasn't provided");
            }
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new ApolloError(`Info about file = ${fileID} not found`);
            }
            return file;
        },
    },
    DatasetInfo: {
        snippet: async ({ fileID }, _, { models }) => {
            if (!fileID) {
                throw new ApolloError("received null fileID");
            }
            const fileInfo = await models.FileInfo.findByPk(fileID, {
                attributes: ["fileID", "path", "delimiter", "hasHeader", "rowsCount"],
            });
            if (!fileInfo) {
                throw new UserInputError(`Incorrect fileID = '${fileID}' was provided`);
            }
            return fileInfo;
        },
        tasks: async ({ fileID }, { filter }, { models }) => {
            const {
                includeExecutedTasks,
                includeCurrentTasks,
                includeTasksWithError,
                includeTasksWithoutError,
                includeDeletedTasks,
            } = filter;
            let where: Record<string, unknown> = { fileID };
            if (
                (!includeExecutedTasks && !includeCurrentTasks) ||
                (!includeTasksWithoutError && !includeTasksWithError)
            ) {
                throw new UserInputError("INVALID INPUT");
            }
            if (includeExecutedTasks !== includeCurrentTasks) {
                where = { ...where, isExecuted: includeExecutedTasks };
            }
            if (includeTasksWithError !== includeTasksWithoutError) {
                where = {
                    ...where,
                    errorMsg: {
                        [includeTasksWithError ? Op.not : Op.is]: null,
                    },
                };
            }
            const options: FindOptions<GeneralTaskConfig> = {
                attributes: ["taskID", "fileID", ["type", "prefix"]],
                raw: true,
                where,
            };
            if (includeDeletedTasks) {
                options.paranoid = false;
            }
            return (await models.GeneralTaskConfig.findAll(
                options
            )) as (GeneralTaskConfig & {
                prefix: MainPrimitiveType;
            })[];
        },
        supportedPrimitives: async ({ fileID, isBuiltIn, fileName }, obj, { models }) => {
            if (isBuiltIn) {
                const dataset = builtInDatasets.find(
                    (info) => info.fileName === fileName
                );
                if (!dataset) {
                    throw new ApolloError("Built in dataset info not found");
                } else {
                    return dataset.supportedPrimitives;
                }
            }
            const fileFormat = await models.FileFormat.findByPk(fileID);
            if (!fileFormat) {
                return ["FD", "CFD", "TypoFD"];
            } else {
                return ["AR"];
            }
        },
        fileFormat: async ({ fileID }, obj, { models }) =>
            await models.FileFormat.findByPk(fileID),
        header: async ({ fileID, hasHeader }, obj, { models }) => {
            if (!fileID) {
                throw new ApolloError("Undefined fileID");
            }
            const fileFormat = await models.FileFormat.findByPk(fileID, {
                attributes: ["fileID"],
            });
            if (fileFormat && !hasHeader) {
                return null;
            }
            return await models.FileInfo.getColumnNamesForFile(fileID);
        },
    },
    Query: {
        datasetInfo: async (parent, { fileID }, { models, sessionInfo }) => {
            if (!isUUID(fileID, 4)) {
                throw new UserInputError("Invalid fileID was provided");
            }
            const file = await models.FileInfo.findByPk(fileID);
            if (!file) {
                throw new UserInputError("File not found");
            }
            if (!file.isValid) {
                throw new ApolloError("File isn't valid");
            }
            if (
                file.isBuiltIn ||
                (sessionInfo && sessionInfo.userID === file.userID) ||
                (sessionInfo && sessionInfo.permissions.includes("VIEW_ADMIN_INFO"))
            ) {
                return file;
            }
            throw new ForbiddenError("You don't have access");
        },
        taskInfo: async (parent, { taskID }, { models, sessionInfo }) => {
            if (!isUUID(taskID, 4)) {
                throw new UserInputError("Invalid taskID was provided", {
                    taskID,
                });
            }
            const taskConfig =
                ((await models.GeneralTaskConfig.findByPk(taskID, {
                    attributes: ["taskID", "fileID", "type", ["type", "prefix"]],
                    raw: true,
                })) as unknown as GeneralTaskConfig & {
                    prefix: MainPrimitiveType;
                }) || null;
            const state = await models.TaskState.findByPk(taskID, {
                attributes: ["userID", "isPrivate"],
            });
            if (!taskConfig || !state) {
                throw new UserInputError("Invalid taskID was provided", {
                    taskID,
                });
            }
            if (!state.userID || !state.isPrivate) {
                return taskConfig;
            }
            if (sessionInfo) {
                if (
                    sessionInfo.userID === state.userID ||
                    sessionInfo.permissions.includes("VIEW_ADMIN_INFO")
                ) {
                    return taskConfig;
                }
            }
            throw new ForbiddenError("User doesn't have permissions");
        },
        tasksInfo: async (parent, { pagination }, { models, sessionInfo }) => {
            if (!sessionInfo || !sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new AuthenticationError("User doesn't have permissions");
            }
            const configs = await models.GeneralTaskConfig.findAll({
                ...pagination,
                attributes: ["taskID", "fileID", ["type", "prefix"]],
                raw: true,
            });

            return (
                (configs as unknown as (GeneralTaskConfig & {
                    prefix: MainPrimitiveType;
                })[]) || []
            );
        },
    },
    Mutation: {
        changeTaskResultsPrivacy: async (
            _,
            { isPrivate, taskID },
            { models, sessionInfo }
        ) => {
            if (!isUUID(taskID, 4)) {
                throw new UserInputError("Incorrect taskID was provided", {
                    taskID,
                });
            }
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            const state = await models.TaskState.findByPk(taskID);
            if (!state) {
                throw new UserInputError("Task not found", { taskID });
            }
            if (!state.userID) {
                throw new UserInputError("Tasks, created by anonymous, can't be private");
            }

            if (
                sessionInfo.permissions.includes("MANAGE_USERS_SESSIONS") ||
                sessionInfo.userID === state.userID
            ) {
                await state.update({ isPrivate });
                return (await models.GeneralTaskConfig.findByPk(
                    taskID
                )) as GeneralTaskConfig & {
                    prefix: MainPrimitiveType;
                };
            } else {
                throw new AuthenticationError("You don't have permission");
            }
        },
    },
};
