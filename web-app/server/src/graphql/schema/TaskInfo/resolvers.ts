import { ApolloError } from "apollo-server-core";
import { CsvParserStream, parse } from "fast-csv";
import { Row } from "@fast-csv/parse";
import fs from "fs";

import { Resolvers } from "../../types/types";

const resolvers: Resolvers = {
    TaskInfoAnswer: {
        __resolveType(obj, { models, logger }, info) {
            switch (obj.info.type) {
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
        table: async(parent, {}, { models, logger }) => {
            // @ts-ignore
            const config = await models.TaskConfig.findByPk(parent.taskID);
            return await models.FileInfo.findByPk(config.fileID);
        }
    },
    FDTaskConfig: {
      baseConfig: async(obj, { }, { models, logger }) => {
          logger("I'm there");
          logger(JSON.stringify(obj));
          // @ts-ignore
          return models.TaskConfig.findByPk(obj.taskID);
      }
    },
    Snippet: {
      table: async(parent, {}, { models, logger }) => {
          // @ts-ignore
          const { fileID } = parent;
          return await models.FileInfo.findByPk(fileID);
      }
    },

    Query: {
        taskInfo: async (parent, { id }, { models, logger }) => {
            const info = await models.TaskInfo.findByPk(id);
            logger(JSON.stringify(info));
            const fdConfig = await models.FDTaskConfig.findByPk(id);
            return {
                info,
                "config": fdConfig,
            };
        },
        snippet: async (parent, { taskID, from, limit}, { models, logger }) => {
            try {
                const taskConfig = await models.TaskConfig.findByPk(taskID);
                const { fileID } = taskConfig;

                const fileInfo = await models.FileInfo.findByPk(fileID);
                const { path, delimiter, hasHeader, renamedHeader } = fileInfo;

                const rows: any[] = [];
                if (hasHeader === true) {
                    from += 1;
                }
                const maxRows = limit - from + 1;

                return await new Promise(resolve => {
                    const parser: CsvParserStream<Row, Row> = parse({
                        delimiter,
                        skipRows: from - 1,
                        maxRows,
                    });

                    fs.createReadStream(path)
                        .pipe(parser)
                        .on("error", (error) => {
                            // 400
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
