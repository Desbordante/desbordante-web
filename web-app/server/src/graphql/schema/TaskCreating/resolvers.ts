import {ApolloError, UserInputError} from "apollo-server-core";
import path from "path";
import { finished } from "stream/promises";

import sendEvent from "../../../producer/sendEvent";
import { Resolvers } from "../../types/types";
import { generateHeaderByFileID } from "./generateHeader";

const getPathToUploadedDataset = (fileName: string) => {
    const rootPath = path.dirname(require.main.filename).split("/");
    rootPath.pop(); // remove folder 'bin'
    rootPath.push("uploads"); // add folder 'uploads'
    rootPath.push(fileName); // add file '${fileID}.csv'
    return rootPath.join("/");
};

const TaskCreatingResolvers: Resolvers = {
    Mutation: {
        // @ts-ignore
        chooseFDTask: async (
            parent, { props, fileID }, { models }) => {

            const { algorithmName, errorThreshold, maxLHS, threadsCount } = props;

            // TODO: Check user input

            try {
                const taskInfo = await models.TaskInfo.create({
                    status: "ADDING TO DB",
                });
                const { taskID } = taskInfo;

                const taskConfig = await taskInfo.createTaskConfig({
                    algorithmName,
                    fileID,
                    taskID,
                    type: "FDA",
                });
                const fdTaskConfig = await taskInfo.createFDTaskConfig({
                    errorThreshold,
                    maxLHS,
                    taskID,
                    threadsCount,
                });
                const fdTaskResult = await taskInfo.createFDTaskResult({
                    taskID,
                });

                await taskInfo.update({ status: "ADDED TO THE DB"});

                const topicName = process.env.KAFKA_TOPIC_NAME;

                await sendEvent(topicName, taskID);
                await taskInfo.update({ status: "ADDED TO THE TASK QUEUE"});

                return taskInfo;

            } catch (e) {
                throw new ApolloError("Internal server error", e);
            }
        },
        createFDTask: async (
            parent, { props, datasetProps, table }, { models, logger }) => {

            const { algorithmName, errorThreshold, maxLHS, threadsCount } = props;
            const { delimiter, hasHeader } = datasetProps;

            // TODO: Check user input

            try {
                const taskInfo = await models.TaskInfo.create({
                    status: "ADDING TO DB && DOWNLOADING FILE",
                });
                const { taskID } = taskInfo;
                const { createReadStream, filename, mimetype, encoding } = await table;

                const stream = createReadStream();

                const file = await models.FileInfo.create({
                    delimiter,
                    encoding,
                    hasHeader,
                    mimeType: mimetype,
                    originalFileName: filename,
                });

                const fileID = file.ID;
                const fileName = `${fileID}.csv`;

                await file.update({ fileName, path: getPathToUploadedDataset(fileName) });

                const out = require("fs").createWriteStream(`uploads/${fileName}`);
                stream.pipe(out);
                await finished(out);

                await file.update({ renamedHeader: JSON.stringify(await generateHeaderByFileID(models, fileID)) });

                await taskInfo.update({ status: "ADDING TO DB"});

                // TODO: USER!
                const taskConfig = await taskInfo.createTaskConfig({
                    algorithmName,
                    delimiter,
                    fileID,
                    taskID,
                    type: "FDA",
                });

                const fdTaskConfig = await taskInfo.createFDTaskConfig({
                    errorThreshold,
                    maxLHS,
                    taskID,
                    threadsCount,
                });

                const fdTaskResult = await taskInfo.createFDTaskResult({
                    taskID,
                });

                await taskInfo.update({ status: "ADDED TO THE DB" });

                const topicName = process.env.KAFKA_TOPIC_NAME;
                await sendEvent(topicName, taskID);
                await taskInfo.update({ status: "ADDED TO THE TASK QUEUE"});

                return taskInfo;
            } catch (e) {
                throw new ApolloError("INTERNAL SERVER ERROR", e);
            }
        },
        deleteTask: async (parent, { taskID }, { models, logger }) => {
            return await models.TaskInfo.findByPk(taskID)
                .then(async (taskInfo: any) => {
                    return await taskInfo.destroy()
                        .then((res: any) => {
                            logger(JSON.stringify(res));
                            return { message: "Task was deleted" };
                        })
                        .catch((e: any) => {
                            logger(e);
                            throw new ApolloError("INTERNAL SERVER ERROR");
                        });
                })
                .catch(async (e: any) => {
                    logger(e);
                    throw new UserInputError("Invalid TaskID");
                });
        }
    }
};

export = TaskCreatingResolvers;
