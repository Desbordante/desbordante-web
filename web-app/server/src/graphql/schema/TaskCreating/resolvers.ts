import { ApolloError } from "apollo-server-core";
import path from "path";
import { finished } from "stream/promises";

import { Resolvers } from "../../types/types";
import { generateHeaderByFileID }  from "./generateHeader";
import sendEvent from "../../../producer/sendEvent";

const getPathToUploadedDataset = (fileName: string) => {
    const rootPath = path.dirname(require.main.filename).split("/");
    rootPath.pop(); // remove folder 'bin'
    rootPath.push("uploads"); // add folder 'uploads'
    rootPath.push(fileName); // add file '${fileID}.csv'
    return rootPath.join("/");
}

const TaskCreatingResolvers : Resolvers = {
    Mutation: {
        chooseFDTask: async (
            _obj, { algProps, fileID }, { models }) => {

            const { algorithmName, errorThreshold, maxLHS, threadsCount } = algProps;

            // TODO: Check user input

            try {
                const taskInfo = await models.TaskInfo.create({
                    type: "FDA",
                    status: "ADDING TO DB",
                });
                const { taskID } = taskInfo

                const taskConfig = await taskInfo.createTaskConfig({
                    taskID,
                    algorithmName,
                    fileID
                })
                const fdTaskConfig = await taskInfo.createFDTaskConfig({
                    taskID,
                    errorThreshold,
                    maxLHS,
                    threadsCount,
                })
                const fdTaskResult = await taskInfo.createFDTaskResult({
                    taskID,
                });

                await taskInfo.update({ status: "ADDED TO THE DB"})

                const topicName = process.env.KAFKA_TOPIC_NAME;

                await sendEvent(topicName, taskID);
                await taskInfo.update({ status: "ADDED TO THE TASK QUEUE"})

                return taskInfo;

            } catch (e) {
                throw new ApolloError("Internal server error", e);
            }
        },
        createFDTask: async (
            parent, { props, fileProps, table }, { models, logger }) => {

            const { algorithmName, errorThreshold, maxLHS, threadsCount } = props;
            const { delimiter, hasHeader } = fileProps;

            // TODO: Check user input

            try {
                const taskInfo = await models.TaskInfo.create({
                    type: "FDA",
                    status: "ADDING TO DB && DOWNLOADING FILE",
                });
                const { taskID } = taskInfo
                const { createReadStream, filename, mimetype, encoding } = await table;

                const stream = createReadStream();

                const file = await models.FileInfo.create({
                    mimeType: mimetype,
                    encoding,
                    originalFileName: filename,
                    hasHeader,
                    delimiter,
                })

                const fileID = file.ID;
                const fileName = `${fileID}.csv`;

                await file.update({ fileName, path: getPathToUploadedDataset(fileName) });

                const out = require('fs').createWriteStream(`uploads/${fileName}`);
                stream.pipe(out);
                await finished(out);

                await file.update({ renamedHeader: JSON.stringify(await generateHeaderByFileID(models, fileID)) });

                await taskInfo.update({ status: "ADDING TO DB"})

                // TODO: USER!
                const taskConfig = await taskInfo.createTaskConfig({
                    taskID,
                    algorithmName,
                    delimiter,
                    fileID
                })

                const fdTaskConfig = await taskInfo.createFDTaskConfig({
                    taskID,
                    errorThreshold,
                    maxLHS,
                    threadsCount,
                })

                const fdTaskResult = await taskInfo.createFDTaskResult({
                    taskID,
                });

                await taskInfo.update({ status: "ADDED TO THE DB" })

                const topicName = process.env.KAFKA_TOPIC_NAME;
                await sendEvent(topicName, taskID);
                await taskInfo.update({ status: "ADDED TO THE TASK QUEUE"})

                return taskInfo;
            } catch (e) {
                throw new ApolloError("INTERNAL SERVER ERROR", e);
            }
        }
    }
}

export = TaskCreatingResolvers;
