import { ApolloError, UserInputError } from "apollo-server-core";
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
    FDTaskConfig: {
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
            const { isExecuted } = await models.TaskInfo.findByPk(parent.taskID, {
                attributes: ["isExecuted"],
            });
            return isExecuted ? parent : null;
        },
        // @ts-ignore
        config: async ({ taskID }, _, { models, logger }) => {
            return await models.FDTaskConfig.findByPk(taskID);
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

        PKs: async (parent, _, { models, logger }) => {
            // @ts-ignore
            const { taskID, fileID } = parent;
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["PKColumnIndices"] });
            if (!result) {
                throw new UserInputError("Invalid taskID was provided", { taskID });
            }
            const indices: number[] = JSON.parse(result.PKColumnIndices || "[]");
            logger(fileID);
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
        pieChartData: async ({ taskID, fileID }, {}, { models, logger }) => {
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
    DatasetInfo: {
        // @ts-ignore
        snippet: async ({ fileID }, { taskID, offset, limit }, { models, logger }) => {
            const fileInfo = await models.FileInfo.findByPk(fileID,
                { attributes: ["path", "delimiter", "hasHeader", "renamedHeader"] });
            if (!fileInfo) {
                throw new InternalServerError(`Incorrect fileID = '${fileID}' was provided`);
            }
            const { path, delimiter, hasHeader, renamedHeader } = fileInfo;

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
                    errorMsg: {
                        [includeTasksWithError ? Op.not : Op.is]: null,
                    },
                };
            }
            return await models.TaskInfo.findAll({ where });
        },
    },

    Query: {
        datasetInfo: async (parent, { fileID }, { models, logger }) => {
            return { fileID };
        },
        taskInfo: async (parent, { id }, { models, logger }) => {
            if (!isUUID(id, 4)) {
                throw new UserInputError("Invalid taskID was provided", { id });
            }

            return await models.BaseTaskConfig.findByPk(id, { attributes: ["taskID", "fileID", "type"] })
                .then(res => {
                    if (!res) {
                        throw new UserInputError("Invalid taskID was provided", { id });
                    }
                    return res;
                }, e => {
                    throw new ApolloError(e.message);
                });
        },
    },
};

export default resolvers;
