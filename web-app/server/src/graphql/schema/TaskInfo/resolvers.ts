import {ApolloError, UserInputError} from "apollo-server-core";
import { CsvParserStream, parse } from "fast-csv";
import { Row } from "@fast-csv/parse";
import fs from "fs";

import { Resolvers } from "../../types/types";

const resolvers: Resolvers = {
    TaskInfoAnswer: {
        // @ts-ignore
        __resolveType({ type }, { models, logger }, info) {
            switch (type) {
                 case "FDA":
                    return "FDATaskInfo";
                 case "CFDA":
                     return "CFDATaskInfo";
                 default:
                     return null;
            }
        }
    },
    BaseTaskConfig: {
        // @ts-ignore
        table: async({ taskID }, {}, { models, logger }) => {
            const { fileID } = await models.TaskConfig.findByPk(taskID);
            return await models.FileInfo.findByPk(fileID);
        }
    },
    FDTaskConfig: {
        // @ts-ignore
        baseConfig: async({ taskID }, {}, { models, logger }) => {
            return models.TaskConfig.findByPk(taskID);
        }
    },
    Snippet: {
        // @ts-ignore
        table: async({ fileID }, {}, { models, logger }) => {
            return await models.FileInfo.findByPk(fileID);
        }
    },
    FDATaskInfo: {
        // @ts-ignore
        result: async ({ taskID }, {}, { models, logger }) => {
            const { fileID } = await models.TaskConfig.findByPk(
                taskID, { attributes: ["fileID"] });
            return { taskID, fileID };
        },
        // @ts-ignore
        info: async ({ taskID }, {}, { models, logger }) => {
            return await models.TaskInfo.findByPk(taskID);
        },
        // @ts-ignore
        config: async({ taskID }, {}, { models, logger }) => {
            return await models.FDTaskConfig.findByPk(taskID);
        }
    },
    FDAResult: {
        // @ts-ignore
        FDs: async ({ taskID }, {}, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["FDs"] });
            logger(JSON.stringify(result));
            return JSON.parse(result.FDs);
        },
        // @ts-ignore
        PKs: async ({ taskID, fileID }, {}, { models, logger }) => {
            const result = await models.FDTaskResult.findByPk(
                taskID, { attributes: ["PKColumnIndices"] });
            const indices: number[] = JSON.parse(result.PKColumnIndices);
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
    Query: {
        taskInfo: async (parent, { id }, { models, logger }) => {
            return await models.TaskInfo.findByPk(id, { attributes: ["type"] })
                .then(({ type }: { type: string }) => ({ taskID: id, type }) )
                .catch((e: any) => {
                    throw new UserInputError("Invalid TaskID");
                })
        },
        snippet: async (parent, { taskID, offset, limit}, { models, logger }) => {
            try {
                const { fileID } = await models.TaskConfig.findByPk(taskID);

                const fileInfo = await models.FileInfo.findByPk(fileID);
                const { path, delimiter, hasHeader, renamedHeader } = fileInfo;

                const rows: any[] = [];
                if (hasHeader === true) {
                    offset += 1;
                }
                const maxRows = limit - offset;

                return await new Promise(resolve => {
                    const parser: CsvParserStream<Row, Row> = parse({
                        delimiter,
                        skipRows: offset,
                        maxRows,
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
                            resolve({ rows, "header": JSON.parse(renamedHeader), fileID });
                        });
                })
            } catch (e) {
                throw new ApolloError("INTERNAL SERVER ERROR", e);
            }
        }
    }
}

export default resolvers;
