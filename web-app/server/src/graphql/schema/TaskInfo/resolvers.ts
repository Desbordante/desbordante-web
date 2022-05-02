import { Row } from "@fast-csv/parse";
import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-core";
import { AuthenticationError } from "apollo-server-express";
import { CsvParserStream, parse } from "fast-csv";
import fs from "fs";
import _ from "lodash";
import { FindOptions, Op } from "sequelize";
import validator from "validator";
import { builtInDatasets } from "../../../db/initBuiltInDatasets";
import { BaseTaskConfig } from "../../../db/models/TaskData/TaskConfig";
import { TaskState, TaskStatusType } from "../../../db/models/TaskData/TaskState";

import { ArSortBy, CfdSortBy, Pagination, PrimitiveType, Resolvers } from "../../types/types";
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

const compareArrays = <T> (lhsArray: T[], rhsArray: T[],
                           cmp: (lhs: T, rhs: T) => boolean) => {
    for (let i = 0; i !== Math.min(lhsArray.length, rhsArray.length); ++i) {
        if (cmp(lhsArray[i], rhsArray[i])) {
            return true;
        }
        if (!_.isEqual(lhsArray[i], rhsArray[i])) {
            return false;
        }
    }
    return lhsArray.length < rhsArray.length;
};

const isIntersects = (lhs: number[], rhs: number[]) => {
    let ai = 0, bi = 0;
    while (ai < lhs.length && bi < rhs.length) {
        if (lhs[ai] < rhs[bi]) {
            ai++;
        } else if (lhs[ai] > rhs[bi]) {
            bi++;
        } else {
            return true;
        }
    }
    return false;
};

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
        lhs: ({ cfd, itemValues, columnNames }) => {
            // @ts-ignore
            return cfd.lhs.map(({ columnIndex: index, patternIndex }) => ({ column: { index, name: columnNames[index] }, pattern: itemValues[patternIndex] }));
        },
        // @ts-ignore
        rhs: ({ cfd, itemValues, columnNames }) => {
            // @ts-ignore
            const { columnIndex: index, patternIndex } = cfd.rhs;
            return { column: { index, name: columnNames[index] }, pattern: itemValues[patternIndex] };
        },
        // @ts-ignore
        support: ({ cfd }) => cfd.support,
        // @ts-ignore
        confidence: ({ cfd }) => cfd.confidence,
    },
    FD: {
        // @ts-ignore
        lhs: ({ dep, columnNames }: { dep: [string[], string], columnNames: string[] }) => {
            return dep[0].map(i => ({ index: i, name: columnNames[Number(i)] }));
        },
        // @ts-ignore
        rhs: ({ dep, columnNames }: { dep: [string[], string] }) => {
            // @ts-ignore
            return { index: dep[1], name: columnNames[dep[1]] };
        },
    },
    AR: {
        // @ts-ignore
        lhs: ({ rule, itemValues }) => rule.lhs.map(i => itemValues[i]),
        // @ts-ignore
        rhs: ({ rule, itemValues }) => rule.rhs.map(i => itemValues[i]),
        // @ts-ignore
        confidence: ({ rule }) => rule.confidence,
    },
    TaskStateAnswer: {
        // @ts-ignore
        __resolveType: ({ status }: { status: TaskStatusType }) => {
            if (status == "INTERNAL_SERVER_ERROR") {
                return "InternalServerTaskError";
            } else if (status == "RESOURCE_LIMIT_IS_REACHED") {
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
            return await models.TaskState.findByPk(taskID);
        },
        // @ts-ignore
        dataset: async ({ fileID }, _, { models }) => {
            return models.FileInfo.findByPk(fileID);
        },
    },
    PrimitiveTaskData: {
        // @ts-ignore
        result: async ({ taskID, propertyPrefix, fileID }, _, { models }) => {
            const taskInfo = await models.TaskState.findByPk(taskID,
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
        specificConfig: async ({
                                   propertyPrefix,
                                   taskID,
                                   fileID,
                               }: { propertyPrefix: PrimitiveType, taskID: string, fileID: string }, _, { models }) => {
            const taskInfo = await models.TaskState.findByPk(taskID, { attributes: ["taskID"] });
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
        FDs: async ({
                        propertyPrefix,
                        taskInfo,
                        fileID,
                    }: { propertyPrefix: PrimitiveType, taskInfo: TaskState, fileID: string }, { filter }, {
                        models,
                        logger,
                    }) => {
            const {
                pagination,
                filterString,
                sortBy,
                sortSide,
                orderBy,
                mustContainLhsColIndices,
                mustContainRhsColIndices,
                withoutKeys,
            } = filter;
            const FDs = await taskInfo.getSingleResultFieldAsString(propertyPrefix, "FDs");
            if (!FDs) {
                return [];
            }
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const columnIndicesOrder = [...Array(columnNames.length).keys()];
            if (sortBy === "COL_NAME") {
                columnIndicesOrder.sort((l, r) => (columnNames[l] < columnNames[r] ? -1 : 1));
            }
            if (orderBy === "DESC") {
                columnIndicesOrder.reverse();
            }

            const mustContainIndices = new Array<number>();
            if (filterString) {
                try {
                    columnNames.forEach((name, id) =>
                        name.match(new RegExp(filterString, "i")) && mustContainIndices.push(id));
                } catch (e) {
                    logger(`User passed incorrect filterString = ${filterString}`);
                    return [];
                }
                if (mustContainIndices.length === 0) {
                    return [];
                }
            }
            type FDType = { lhs: number[], rhs: number }

            let keyIndices = Array<number>();
            if (withoutKeys) {
                const keysString = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "PKColumnIndices");
                keyIndices = keysString.split(",").map(i => Number(i));
            }

            const fdFilter = ({ lhs, rhs }: FDType) => {
                if (mustContainRhsColIndices != undefined && mustContainRhsColIndices.length !== 0 && !~_.sortedIndexOf(mustContainRhsColIndices, rhs)) {
                    return false;
                }
                if (mustContainLhsColIndices != undefined && mustContainLhsColIndices.length !== 0
                    && !isIntersects(lhs, mustContainLhsColIndices)) {
                    return false;
                }
                if (mustContainIndices.length !== 0
                    && !isIntersects(mustContainIndices, lhs) && !~_.sortedIndexOf(mustContainIndices, rhs)) {
                    return false;
                }
                if (keyIndices.length !== 0 && isIntersects(keyIndices, lhs)) {
                    return false;
                }
                return true;
            };

            const fdItemComparator = (lhs: number, rhs: number) => columnIndicesOrder[lhs] < columnIndicesOrder[rhs];

            const fdComparator = (lhsFD: FDType, rhsFD: FDType) => {
                const lhs = sortSide === "LHS" ? [...lhsFD.lhs, lhsFD.rhs] : [...lhsFD.lhs, lhsFD.rhs];
                const rhs = sortSide === "LHS" ? [...rhsFD.lhs, rhsFD.rhs] : [rhsFD.rhs, ...rhsFD.lhs];
                return compareArrays(lhs, rhs, fdItemComparator) ? -1 : 1;
            };

            const FDsUnionIndices = FDs.split(";")
                .map(unionIndices => unionIndices.split(",").map(Number));
            const deps = FDsUnionIndices.map(unionIndices => ({
                lhs: unionIndices.slice(0, unionIndices.length - 1),
                rhs: unionIndices[unionIndices.length - 1],
            } as FDType))
                .filter(fdFilter)
                .sort(fdComparator);
            return getArrayOfDepsByPagination(deps, pagination).map(({ lhs, rhs }) => ({
                dep: [[...lhs], rhs],
                columnNames,
            }));
        },
        // @ts-ignore
        PKs: async ({ propertyPrefix, taskInfo, fileID }, _, { models }) => {
            const keysString = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "PKColumnIndices");
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            if (!keysString) {
                return [];
            }
            return keysString.split(",").map(i => Number(i)).map((index) => ({ index, name: columnNames[index] }));
        },
        // @ts-ignore
        pieChartData: async ({ propertyPrefix, taskInfo, fileID }, obj, { models }) => {
            const pieChartData = await taskInfo.getSingleResultFieldAsString(propertyPrefix, "withoutPatterns");
            const [lhs, rhs] = pieChartData.split("|");

            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const transformFromCompactData = (data: string) => {
                return data.split(";").filter(line => line.length !== 0)
                    .map((keyValueStr: string) => keyValueStr.split(","))
                    .map(([index, value]) => ({ column: { index, name: columnNames[Number(index)] }, value }));
            };

            return { lhs: transformFromCompactData(lhs), rhs: transformFromCompactData(rhs) };
        },
        // @ts-ignore
        depsAmount: async ({ propertyPrefix, taskInfo }) => {
            const depsAmount = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "depsAmount");
            return Number(depsAmount);
        },
    },
    TypoFDTaskResult: {
        // @ts-ignore
        TypoFDs: async ({ propertyPrefix, taskInfo, fileID }: { propertyPrefix: PrimitiveType, taskInfo: TaskState }, { filter }, { models, logger }) => {
            const typoFDs = await taskInfo.getSingleResultFieldAsString(propertyPrefix, "TypoFDs");
            const { pagination, filterString, sortBy, sortSide, orderBy } = filter;
            if (!typoFDs) {
                return [];
            }

            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const columnIndicesOrder = [...Array(columnNames.length).keys()];
            if (sortBy === "COL_NAME") {
                columnIndicesOrder.sort((l, r) => (columnNames[l] < columnNames[r] ? -1 : 1));
            }
            if (orderBy === "DESC") {
                columnIndicesOrder.reverse();
            }

            const mustContainIndices = new Array<number>();
            if (filterString) {
                try {
                    columnNames.forEach((name, id) =>
                        name.match(new RegExp(filterString, "i")) && mustContainIndices.push(id));
                } catch (e) {
                    logger(`User passed incorrect filterString = ${filterString}`);
                    return [];
                }
                if (mustContainIndices.length === 0) {
                    return [];
                }
            }
            type FDType = { lhs: number[], rhs: number }

            const fdFilter = ({ lhs, rhs }: FDType) => {
                if (mustContainIndices.length !== 0
                    && !isIntersects(mustContainIndices, lhs) && !~_.sortedIndexOf(mustContainIndices, rhs)) {
                    return false;
                }
                return true;
            };

            const fdItemComparator = (lhs: number, rhs: number) => columnIndicesOrder[lhs] < columnIndicesOrder[rhs];

            const fdComparator = (lhsFD: FDType, rhsFD: FDType) => {
                const lhs = sortSide === "LHS" ? [...lhsFD.lhs, lhsFD.rhs] : [...lhsFD.lhs, lhsFD.rhs];
                const rhs = sortSide === "LHS" ? [...rhsFD.lhs, rhsFD.rhs] : [rhsFD.rhs, ...rhsFD.lhs];
                return compareArrays(lhs, rhs, fdItemComparator) ? -1 : 1;
            };

            const FDsUnionIndices = typoFDs.split(";")
                .map(unionIndices => unionIndices.split(",").map(Number));
            const deps = FDsUnionIndices.map(unionIndices => ({
                lhs: unionIndices.slice(0, unionIndices.length - 1),
                rhs: unionIndices[unionIndices.length - 1],
            } as FDType))
                .filter(fdFilter)
                .sort(fdComparator);
            return getArrayOfDepsByPagination(deps, pagination).map(({ lhs, rhs }) => ({
                dep: [[...lhs], rhs],
                columnNames,
            }));
        },
        // @ts-ignore
        depsAmount: async ({ propertyPrefix, taskInfo }) => {
            const depsAmount = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "depsAmount");
            return Number(depsAmount);
        },
    },
    TypoClusterTaskConfig: {
        // @ts-ignore
        typoFD: async ({ typoFD, typoTaskID }: { typoFD: string, typoTaskID: string }, _, { models }) => {
            const parentConfig = await models.BaseTaskConfig.findByPk(typoTaskID);
            if (!parentConfig) {
                throw new ApolloError("Parent task not found");
            }
            const columnNames = await models.FileInfo.getColumnNamesForFile(parentConfig.fileID);
            const depIndices = typoFD.split(",").map(Number);
            return { dep: [depIndices.slice(0, depIndices.length - 1), depIndices[depIndices.length - 1]], columnNames };
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
        ARs: async ({ propertyPrefix, taskInfo }, { filter }, { models, logger }) => {
            const { pagination, filterString, orderBy } = filter;
            let { sortBy } = filter;
            const [ARs, valueDictionary]: string[] = await taskInfo.getMultipleResultFieldAsString(propertyPrefix, ["ARs", "valueDictionary"]);
            if (!ARs || !valueDictionary) {
                return [];
            }
            if (sortBy === "DEFAULT") {
                sortBy = "CONF" as ArSortBy;
            }
            const itemValues = valueDictionary.split(",");

            const itemIndicesOrder = [...Array(itemValues.length).keys()];
            if (sortBy === "LHS_NAME") {
                itemIndicesOrder.sort((l, r) => (itemValues[l] < itemValues[r] ? -1 : 1));
            }
            if (orderBy === "DESC") {
                itemIndicesOrder.reverse();
            }

            const mustContainIndices = new Array<number>();
            if (filterString) {
                try {
                    itemValues.forEach((value, id) =>
                        value.match(new RegExp(filterString, "i")) && mustContainIndices.push(id));
                } catch (e) {
                    logger(`User passed incorrect filterString = ${filterString}`);
                    return [];
                }
                if (mustContainIndices.length === 0) {
                    return [];
                }
            }
            type ARType = { lhs: number[], rhs: number[], confidence: number }


            const ARFilter = ({ lhs, rhs }: ARType) => {
                if (mustContainIndices.length !== 0
                    && !isIntersects(mustContainIndices, lhs) && !isIntersects(mustContainIndices, rhs)) {
                    return false;
                }
                return true;
            };
            const ARItemComparator = (lhs: number, rhs: number) => itemIndicesOrder[lhs] < itemIndicesOrder[rhs];

            const ARComparator = (lhsFD: ARType, rhsFD: ARType) => {
                const lhs = sortBy === "LHS_NAME" ? [...lhsFD.lhs, ...lhsFD.rhs] : [...lhsFD.lhs, ...lhsFD.rhs];
                const rhs = sortBy === "RHS_NAME" ? [...rhsFD.lhs, ...rhsFD.rhs] : [...rhsFD.rhs, ...rhsFD.lhs];
                if (sortBy === "CONF") {
                    if (lhsFD.confidence !== rhsFD.confidence) {
                        const ans = lhsFD.confidence > rhsFD.confidence ? -1 : 1;
                        return orderBy == "DESC" ? ans : -ans;
                    }
                }
                return compareArrays(lhs, rhs, ARItemComparator) ? -1 : 1;
            };

            const ARsUnionIndices = ARs.split(";")
                .map(unionIndices => unionIndices.split(":").map(ruleCompact => ruleCompact.split(",").map(Number)));
            const deps = ARsUnionIndices.map(rule => ({ confidence: rule[0][0], lhs: rule[1], rhs: rule[2] } as ARType))
                .filter(ARFilter)
                .sort(ARComparator);
            return getArrayOfDepsByPagination(deps, pagination).map((rule) => ({ rule, itemValues }));
        },
        // @ts-ignore
        depsAmount: async ({ propertyPrefix, taskInfo }) => {
            const depsAmount = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "depsAmount");
            return Number(depsAmount);
        },
    },
    Cluster: {
        // @ts-ignore
        items: async ({ rows, rowIndices, suspiciousIndices }, { pagination }) => {
            return getArrayOfDepsByPagination(rowIndices.map((i: number) => ({
                row: rows.get(i),
                rowIndex: i,
                isSuspicious: suspiciousIndices.has(i),
            })), pagination);
        },
    },
    SquashedCluster: {
        // @ts-ignore
        items: async ({ rows, rowIndicesWithAmount }, { pagination }) => {
            return getArrayOfDepsByPagination(rowIndicesWithAmount.map(({
                                                                            rowIndex,
                                                                            amount,
                                                                        }: { rowIndex: number, amount: number }) => ({
                row: rows.get(rowIndex),
                rowIndex,
                amount,
            })), pagination);
        },
    },
    TypoClusterTaskResult: {
        // @ts-ignore
        TypoClusters: async ({ propertyPrefix, taskInfo, fileID }, { pagination }, { models }) => {
            const [TypoClusters, SuspiciousIndicesStr] = await (taskInfo as TaskState).getMultipleResultFieldAsString(propertyPrefix, ["TypoClusters", "suspiciousIndices"]);
            if (!TypoClusters) {
                return [];
            }
            const clustersSuspiciousIndices = SuspiciousIndicesStr.split(";").map(data => new Set(data.split(",").map(Number)));

            let typoClusters = TypoClusters.split(";")
                .map((indices, id) => ({
                    rowIndices: indices.split(",").map(Number),
                    suspiciousIndices: clustersSuspiciousIndices[id],
                }));
            typoClusters = getArrayOfDepsByPagination(typoClusters, pagination);
            let indices: number[] = [];
            for (const typoCluster of typoClusters) {
                indices = [...new Set([...indices, ...typoCluster.rowIndices])];
            }
            if (fileID == undefined) {
                const typoTaskID = await (taskInfo as TaskState).getSingleConfigFieldAsString(propertyPrefix, "typoTaskID");
                const typoTaskConfig = await models.BaseTaskConfig.findByPk(typoTaskID, { attributes: ["fileID"] });
                if (!typoTaskConfig) {
                    throw new ApolloError("Parent task config not found");
                }
                fileID = typoTaskConfig.fileID;
            }

            const file = await models.FileInfo.findByPk(fileID, { attributes: ["path", "delimiter", "hasHeader"] });
            if (!file) {
                throw new ApolloError("File not found");
            }
            const rows = await models.FileInfo.GetRowsByIndices(file.path, file.delimiter, indices, file.hasHeader);
            return typoClusters.map((typoCluster, id) => ({
                ...typoCluster,
                id,
                rows,
                itemsAmount: typoCluster.rowIndices.length,
            }));
        },
        // @ts-ignore
        clustersCount: async ({ propertyPrefix, taskInfo }) => {
            const clustersCount = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "clustersCount");
            if (!clustersCount) {
                throw new ApolloError("Clusters count not found");
            }
            return clustersCount;
        },
    },
    SpecificTypoClusterTaskResult: {
        // @ts-ignore
        cluster: async ({ propertyPrefix, taskInfo, fileID }, { sort }, { models, logger }) => {
            const [SuspiciousIndicesStr, rowIndicesStr] = await (taskInfo as TaskState)
                .getMultipleResultFieldAsString(propertyPrefix, ["suspiciousIndices", `notSquashed${sort ? "" : "Not"}SortedCluster`]);
            const rowIndices = rowIndicesStr.split(",").map(Number);

            const [clusterID, typoClusterTaskID] = await (taskInfo as TaskState).getMultipleConfigFieldAsString(propertyPrefix, ["clusterID", "typoClusterTaskID"]);
            const suspiciousIndices = SuspiciousIndicesStr.split(";").map(data => new Set(data.split(",").map(Number)))[Number(clusterID)];
            if (fileID == undefined) {
                const typoClusterConfig = await models.TypoClusterConfig.findByPk(typoClusterTaskID, { attributes: ["typoTaskID"] });
                if (!typoClusterConfig) {
                    throw new ApolloError("Parent task config not found");
                }
                const { typoTaskID } = typoClusterConfig;
                const typoTaskConfig = await models.BaseTaskConfig.findByPk(typoTaskID, { attributes: ["fileID"] });
                if (!typoTaskConfig) {
                    throw new ApolloError("Parent task config not found");
                }
                fileID = typoTaskConfig.fileID;
            }

            const file = await models.FileInfo.findByPk(fileID, { attributes: ["path", "delimiter", "hasHeader"] });
            if (!file) {
                throw new ApolloError("File not found");
            }
            const rows = await models.FileInfo.GetRowsByIndices(file.path, file.delimiter, Array.from(rowIndices), file.hasHeader);
            const id = Number(clusterID);
            return { rowIndices, suspiciousIndices, id, rows, itemsAmount: rowIndices.length };
        },
        // @ts-ignore
        squashedCluster: async ({ propertyPrefix, taskInfo, fileID }, { sort }, { models, logger }) => {
            const squashedCluster = await (taskInfo as TaskState)
                .getSingleResultFieldAsString(propertyPrefix, `squashed${sort ? "" : "Not"}SortedCluster`);
            const rowIndicesWithAmount = squashedCluster
                .split(";")
                .map(squashedItem => squashedItem.split(",").map(Number))
                .map(([rowIndex, amount]) => ({ rowIndex, amount }));

            const clusterID = await (taskInfo as TaskState).getSingleConfigFieldAsString(propertyPrefix, "clusterID");

            const file = await models.FileInfo.findByPk(fileID, { attributes: ["path", "delimiter", "hasHeader"] });
            if (!file) {
                throw new ApolloError("File not found");
            }
            const rows = await models.FileInfo.GetRowsByIndices(file.path, file.delimiter, rowIndicesWithAmount.map(({ rowIndex }) => rowIndex), file.hasHeader);
            const id = Number(clusterID);
            return { rowIndicesWithAmount, id, rows, itemsAmount: rowIndicesWithAmount.length };
        },
    },
    CFDPieCharts: {
        // @ts-ignore
        withoutPatterns: async ({ propertyPrefix, taskInfo, fileID }, obj, { models }) => {
            const pieChartData = await taskInfo.getSingleResultFieldAsString(propertyPrefix, "withoutPatterns");
            const [lhs, rhs] = pieChartData.split("|");

            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const transformFromCompactData = (data: string) => {
                return data.split(";").filter(line => line.length !== 0)
                    .map((keyValueStr: string) => keyValueStr.split(","))
                    .map(([index, value]) => ({ column: { index, name: columnNames[Number(index)] }, value }));
            };

            return { lhs: transformFromCompactData(lhs), rhs: transformFromCompactData(rhs) };
        },
        // @ts-ignore
        withPatterns: async (parent) => {
            throw new ForbiddenError("Pie chart data with patterns not supported yet");
        },
    },
    CFDTaskResult: {
        // @ts-ignore
        CFDs: async ({ propertyPrefix, taskInfo, fileID }, { filter }, { models, logger }) => {
            const { pagination, filterString, orderBy, mustContainLhsColIndices, mustContainRhsColIndices } = filter;
            let sortBy = filter.sortBy;
            const [CFDsCompact, valueDictionary] = await (taskInfo as TaskState)
                .getMultipleResultFieldAsString(propertyPrefix, ["CFDs", "valueDictionary"]);
            if (!CFDsCompact || !valueDictionary) {
                return [];
            }
            if (sortBy === "DEFAULT") {
                sortBy = "CONF" as CfdSortBy;
            }
            const itemValues = valueDictionary.split(",");

            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            const columnIndicesOrder = [...Array(columnNames.length).keys()];
            if (sortBy !== "LHS_COL_ID" && sortBy === "RHS_COL_ID") {
                columnIndicesOrder.sort((l, r) => (columnNames[l] < columnNames[r] ? -1 : 1));
            }

            type Item = {
                columnIndex: number
                patternIndex: number
            }

            const mustContainIndices = new Array<number>();
            const mustContainItems: Item[] = [];
            if (filterString) {
                try {
                    if (filterString.includes("=")) {
                        const columnWithPattern = filterString.split("=");
                        if (columnWithPattern.length != 2) {
                            logger(`User passed incorrect filterString = ${filterString}, with 2 or more equal signs`);
                            return [];
                        }
                        const [colName, pattern] = columnWithPattern;
                        columnNames.forEach((name, id) => {
                                name.match(new RegExp(colName, "i")) && mustContainItems.push(
                                    { columnIndex: id, patternIndex: itemValues.indexOf(pattern) });
                            });
                        if (!itemValues.includes(pattern)) {
                            logger(`Input pattern value '${pattern}' not found`);
                            return [];
                        }
                    } else {
                        columnNames.forEach((name, id) =>
                            name.match(new RegExp(filterString, "i")) && mustContainIndices.push(id));
                    }
                    if (mustContainItems.length === 0 && mustContainIndices.length === 0) {
                        return [];
                    }
                } catch (e) {
                    logger(`User passed incorrect filterString = ${filterString}`);
                    return [];
                }
            }

            type CFDCompactType = {
                lhs: Item[],
                rhs: Item,
                support: number,
                confidence: number,
            }

            const cfdFilter = ({ lhs, rhs }: CFDCompactType) => {
                if (mustContainRhsColIndices && mustContainRhsColIndices.length !== 0
                    && !~_.sortedIndexOf(mustContainRhsColIndices, rhs.columnIndex)) {
                    return false;
                }
                const lhsIndices = lhs.map(({ columnIndex }) => columnIndex);
                if (mustContainLhsColIndices && mustContainLhsColIndices.length !== 0
                    && !isIntersects(lhsIndices, mustContainLhsColIndices)) {
                    return false;
                }
                if (mustContainIndices.length !== 0
                    && !isIntersects(mustContainIndices, lhsIndices)
                    && !~_.sortedIndexOf(mustContainIndices, rhs.columnIndex)) {
                    return false;
                }
                const isEqual = (lhs: Item, rhs: Item) => {
                    return lhs.columnIndex == rhs.columnIndex && lhs.patternIndex == rhs.patternIndex;
                };
                if (mustContainItems.length !== 0 && (!mustContainItems.some(item => isEqual(item, rhs))
                    && !lhs.some(lhsItem => mustContainItems.some(item => isEqual(item, lhsItem))))) {
                    return false;
                }
                return true;
            };

            const itemFromLine = (line: string): Item => {
                const [columnIndex, patternIndex] = line.split("=").map(Number);
                return { columnIndex, patternIndex };
            };

            type sortFunctionType = (lhs: CFDCompactType, rhs: CFDCompactType) => boolean;
            const cfdItemNameComparator = (lhs: Item, rhs: Item) =>
                columnIndicesOrder[lhs.columnIndex] < columnIndicesOrder[rhs.columnIndex]
                || columnIndicesOrder[lhs.columnIndex] === columnIndicesOrder[rhs.columnIndex] && lhs.patternIndex < rhs.patternIndex;
            const cfdItemIdComparator = (lhs: Item, rhs: Item) =>
                lhs.columnIndex < rhs.columnIndex ||
                lhs.columnIndex === rhs.columnIndex && lhs.patternIndex < rhs.patternIndex;

            // @ts-ignore
            const sortFunctions: { sortBy: string, f: sortFunctionType }[] = [
                { sortBy: "CONF", f: (lhs, rhs) => lhs.confidence < rhs.confidence },
                { sortBy: "SUP", f: (lhs, rhs) => lhs.support < rhs.support },
                { sortBy: "LHS_COL_NAME", f: (lhs, rhs) => compareArrays(lhs.lhs, rhs.lhs, cfdItemNameComparator) },
                { sortBy: "RHS_COL_NAME", f: (lhs, rhs) => cfdItemNameComparator(lhs.rhs, rhs.rhs) },
                { sortBy: "LHS_COL_ID", f: (lhs, rhs) => compareArrays(lhs.lhs, rhs.lhs, cfdItemIdComparator) },
                { sortBy: "RHS_COL_ID", f: (lhs, rhs) => cfdItemIdComparator(lhs.rhs, rhs.rhs) },
            ];
            const temp = sortFunctions[0];
            const mainSortFunctionIndex = sortFunctions.findIndex((sort) => sort.sortBy === sortBy);
            sortFunctions[0] = sortFunctions[mainSortFunctionIndex];
            sortFunctions[mainSortFunctionIndex] = temp;

            const comparator = (lhs: CFDCompactType, rhs: CFDCompactType): -1 | 1 => {
                for (const { f } of sortFunctions) {
                    if (f(lhs, rhs)) {
                        return -1;
                    } else if (f(rhs, lhs)) {
                        return 1;
                    }
                }
                throw new ApolloError(`Unreachable code ${lhs.toString()} == ${rhs.toString()}`);
            };
            const CFDs = CFDsCompact.split(";")
                .map(compactCFD => compactCFD.split(":"))
                .map(([confidence, lhs, rhs, support]) => ({
                    lhs: lhs.split(",").filter(line => line.length !== 0).map(line => itemFromLine(line)),
                    rhs: itemFromLine(rhs),
                    support: Number(support),
                    confidence: Number(confidence),
                }));
            const deps = CFDs.filter(cfdFilter).sort(comparator);
            if (orderBy === "DESC") {
                deps.reverse();
            }
            return getArrayOfDepsByPagination(deps, pagination).map(cfd => ({ cfd, columnNames, itemValues }));
        },
        // @ts-ignore
        pieChartData: async (parent) => {
            return parent;
        },
        // @ts-ignore
        PKs: async ({ propertyPrefix, taskInfo, fileID }, _, { models }) => {
            const keysString = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "PKColumnIndices");
            const columnNames = await models.FileInfo.getColumnNamesForFile(fileID);
            if (!keysString) {
                return [];
            }
            return keysString.split(",").map(i => Number(i)).map((index) => ({ index, name: columnNames[index] }));
        },
        // @ts-ignore
        depsAmount: async ({ propertyPrefix, taskInfo }) => {
            const depsAmount = await (taskInfo as TaskState).getSingleResultFieldAsString(propertyPrefix, "depsAmount");
            return Number(depsAmount);
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
            if (offset > rowsCount || offset < 0) {
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
        header: async ({ fileID, hasHeader }, _, { models }) => {
            const fileFormat = await models.FileFormat.findByPk(fileID, { attributes: ["fileID"] });
            if (fileFormat && !hasHeader) {
                return null;
            }
            return await models.FileInfo.getColumnNamesForFile(fileID);
        },
        // @ts-ignore
        datasetInfo: async ({ fileID }, _, { models }) => {
            return await models.FileInfo.findByPk(fileID);
        },
    },
    DatasetInfo: {
        // @ts-ignore
        snippet: async ({ fileID }, _, { models }) => {
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
            const {
                includeExecutedTasks, includeCurrentTasks,
                includeTasksWithError, includeTasksWithoutError, includeDeletedTasks,
            } = filter;
            let where: any = { fileID };
            if (!includeExecutedTasks && !includeCurrentTasks
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
            const options: FindOptions<BaseTaskConfig> = {
                attributes: ["taskID", "fileID", ["type", "propertyPrefix"]],
                raw: true,
                where,
            };
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
                return ["AR"];
            }
        },
        // @ts-ignore
        fileFormat: async ({ fileID }, obj, { models }) => {
            return await models.FileFormat.findByPk(fileID);
        },
        // @ts-ignore
        header: async ({ fileID, hasHeader }, obj, { models }) => {
            if (!fileID) {
                throw new ApolloError("Undefined fileID");
            }
            const fileFormat = await models.FileFormat.findByPk(fileID, { attributes: ["fileID"] });
            if (fileFormat && !hasHeader) {
                return null;
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
            const taskInfo = await models.TaskState.findByPk(taskID,
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
            const taskInfo = await models.TaskState.findByPk(taskID);
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
