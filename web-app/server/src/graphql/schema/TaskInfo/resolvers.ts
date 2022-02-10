import {ApolloError, UserInputError} from "apollo-server-core";
import { CsvParserStream, parse } from "fast-csv";
import { Row } from "@fast-csv/parse";
import fs from "fs";
import {Op} from "sequelize";

import { Resolvers } from "../../types/types";

const resolvers: Resolvers = {
    TaskData: {
        // @ts-ignore
        __resolveType({ type }, { models, logger }, info) {
            switch (type) {
                 case "FDA":
                    return "FDTask";
                 case "CFDA":
                     return "CFDATask";
                 default:
                     return null;
            }
        }
    },
    FDTaskConfig: {
        // @ts-ignore
        baseConfig: async({ taskID }, {}, { models, logger }) => {
            return await models.TaskConfig.findByPk(taskID);
        }
    },
    TaskInfo: {
        // @ts-ignore
        data: async ({ taskID }, {}, { models, logger }) => {
            return await models.TaskConfig.findByPk(taskID,
                { attributes: ["type", "taskID", "fileID"] });
        },
        // @ts-ignore
        state: async ({ taskID }, {}, { models, logger }) => {
            return await models.TaskInfo.findByPk(taskID);
        },
        // @ts-ignore
        dataset: async ({ taskID, fileID }, {}, { models, logger }) => {
            return { fileID };
        }
    },
    FDTask: {
        // @ts-ignore
        result: async (parent, {}, { models, logger }) => {
            // @ts-ignore
            const { isExecuted } = await models.TaskInfo.findByPk(parent.taskID, {
                attributes: ["isExecuted"]
            });
            return isExecuted ? parent : null;
        },
        // @ts-ignore
        config: async ({ taskID }, {}, { models, logger }) => {
            return await models.FDTaskConfig.findByPk(taskID);
        }
    },
    FDResult: {
        // @ts-ignore
        FDs: async ({ taskID }, {}, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["FDs"] });
            return JSON.parse(result.FDs);
        },
        // @ts-ignore
        PKs: async ({ taskID, fileID }, {}, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["PKColumnIndices"] });
            const indices: number[] = JSON.parse(result.PKColumnIndices) || [];
            logger(fileID);
            const { renamedHeader } = await models.FileInfo.findByPk(
                fileID, { attributes: ["renamedHeader"] }
            );
            const columnNames = JSON.parse(renamedHeader);
            return indices.map((index) => ({ index, name: columnNames[index] }));
        },
        // @ts-ignore
        pieChartData: async ({ taskID, fileID }, {}, { models, logger }) => {
            const { pieChartData } = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["pieChartData"] });

            type itemType = { idx: number, value: number };
            const { lhs, rhs } : { lhs: [itemType], rhs: [itemType] }
                = JSON.parse(pieChartData);
            logger(JSON.stringify(lhs));
            const { renamedHeader } = await models.FileInfo.findByPk(
                fileID, { attributes: ["renamedHeader"] });
            const columnNames = JSON.parse(renamedHeader);

            const transform = ({ idx, value} : itemType) => (
                { column: { index: idx, name: columnNames[idx] }, value });

            return { lhs:  lhs.map(transform), rhs: rhs.map(transform) };
        }
    },
    DatasetInfo: {
        // @ts-ignore
        snippet: async ({ fileID }, { taskID, offset, limit}, { models, logger }) => {
            try {
                const fileInfo = await models.FileInfo.findByPk(fileID,
                    {}, { attributes: [ "path", "delimiter", "hasHeader", "renamedHeader" ]});
                const { path, delimiter, hasHeader, renamedHeader } = fileInfo;

                const rows: any[] = [];
                if (hasHeader === true) {
                    offset += 1;
                }

                return await new Promise(resolve => {
                    const parser: CsvParserStream<Row, Row> = parse({
                        delimiter,
                        skipRows: offset,
                        maxRows: limit,
                    });

                    fs.createReadStream(path)
                        .pipe(parser)
                        .on("error", (error) => {
                            throw new ApolloError("ERROR WHILE READING FILE");
                        })
                        .on("data", (row) => {
                            rows.push(row);
                        })
                        .on("end", () => {
                            // @ts-ignore
                            resolve({ rows, header: JSON.parse(renamedHeader), fileID });
                        });
                })
            } catch (e) {
                throw new UserInputError("BAD USER INPUT", e);
            }
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
                        [includeTasksWithError ? Op.not : Op.is]: null
                    }
                };
            }
            return await models.TaskInfo.findAll({ where });
        }
    },

    Query: {
        // @ts-ignore
        datasetInfo: async (parent, { fileID }, { models, logger }) => {
            return { fileID };
        },
        // @ts-ignore
        taskInfo: async (parent, { id }, { models, logger }) => {
            return await models.TaskConfig.findByPk(id, { attributes: ["taskID", "fileID", "type"] })
                .then((res: any) => res)
                .catch((e: any) => {
                    throw new UserInputError("Invalid TaskID");
                });
        },
    }
}

export default resolvers;
