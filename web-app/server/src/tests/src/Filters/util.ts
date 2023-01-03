import { testQuery } from "../../util";
import models from "../../../db/models";
import { ARTaskResult, CFDTaskResult, FDTaskResult } from "../../../db/models/TaskData/results/TasksWithDeps";
import { taskInfo, taskInfoVariables } from "./queries/__generated__/taskInfo";
import { v4 as uuidv4 } from "uuid";
import { TaskState } from "../../../db/models/TaskData/TaskState";
import { ARTaskConfig, CFDTaskConfig, FDTaskConfig } from "../../../db/models/TaskData/configs/SpecificConfigs";
import { GeneralTaskConfig } from "../../../db/models/TaskData/configs/GeneralTaskConfig";
import { FileInfo } from "../../../db/models/FileData/FileInfo";
import { MainPrimitiveType } from "../../../graphql/types/types";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getDepsWithTyping = (data: taskInfo) => {
    if (data.taskInfo.data.__typename == "TaskWithDepsData") {
        if (data.taskInfo.data.result?.__typename === "FDTaskResult") {
            return data.taskInfo.data.result.filteredDepsFD.deps;
        } else if (data.taskInfo.data.result?.__typename === "CFDTaskResult") {
            return data.taskInfo.data.result.filteredDepsCFD.deps;
        } else if (data.taskInfo.data.result?.__typename === "ARTaskResult") {
            return data.taskInfo.data.result.filteredDepsAR.deps;
        }
    }

    throw Error("There's no deps or this type is not yet implemented");
};

export const createTestData = async (primitive: MainPrimitiveType, deps: string, algorithm: string): Promise<{
    taskUUID: string;
    fileUUID: string;
}> => {

    const taskUUID= uuidv4();
    const fileUUID = uuidv4();

    await TaskState.create({
        taskID: taskUUID,
        status: "COMPLETED",
        phaseName: ((primitive === "AR") ? "Data" : primitive) + " Mining",
        currentPhase: 1,
        progress: 100,
        maxPhase: 1,
        isExecuted: true,
        elapsedTime: 0,
    }).catch(err => console.log(err.message));

    if (primitive === "FD") {
        await FDTaskConfig.create({
            taskID: taskUUID,
            errorThreshold: 0.5,
            maxLHS: -1,
            threadsCount: 1,
        }).catch(err => console.log(err.message));

    } else if (primitive === "CFD") {
        await CFDTaskConfig.create({
            taskID: taskUUID,
            maxLHS: -1,
            minSupportCFD: 1,
            minConfidence: 0.5,
        }).catch(err => console.log(err.message));
    } else if (primitive === "AR") {
        await ARTaskConfig.create({
            taskID: taskUUID,
            maxLHS: -1,
            minSupportAR: 0.1,
            minConfidence: 0.1,
        }).catch(err => console.log(err.message));
    }

    await FileInfo.create({
        fileID: fileUUID,
        originalFileName: "test",
        hasHeader: true,
        delimiter: ",",
        renamedHeader: "[\"A\", \"B\", \"C\"]",
        isValid: true,
    }).catch(err => console.log(err.message));

    await GeneralTaskConfig.create({
        taskID: taskUUID,
        fileID: fileUUID,
        algorithmName: algorithm,
        type: primitive,
    }).catch(err => console.log(err.message));

    if (primitive === "FD") {
        await FDTaskResult.create({
            taskID: taskUUID,
            depsAmount: 3,
            deps: deps,
        }).catch(err => console.log(err.message));
    } else if (primitive === "CFD") {
        await CFDTaskResult.create({
            taskID: taskUUID,
            depsAmount: 3,
            deps: deps,
            valueDictionary: "_,1,2,3,4,5,7,8",
        }).catch(err => console.log(err.message));
    } else if (primitive === "AR") {
        await ARTaskResult.create({
            taskID: taskUUID,
            depsAmount: 3,
            deps: deps,
            valueDictionary: "A,B,C",
        }).catch(err => console.log(err.message));
    }

    return { taskUUID, fileUUID };
};

export const cleanUp = async (primitive: MainPrimitiveType, uuid: string, fileUUID: string) => {

    await TaskState.destroy({
        where: {
            taskID: uuid,
        },
        force: true,
    }).catch(err => console.log(err.message));

    await FileInfo.destroy({
        where: {
            fileID: fileUUID,
        },
        force: true,
    }).catch(err => console.log(err.message));

    await GeneralTaskConfig.destroy({
        where: {
            taskID: uuid,
        },
        force: true,
    }).catch(err => console.log(err.message));

    if (primitive === "FD") {
        await FDTaskResult.destroy({
            where: {
                taskID: uuid,
            },
            force: true,
        }).catch(err => console.log(err.message));

        await FDTaskConfig.destroy({
            where: {
                taskID: uuid,
            },
            force: true,
        }).catch(err => console.log(err.message));
    } else if (primitive === "CFD") {
        await CFDTaskResult.destroy({
            where: {
                taskID: uuid,
            },
            force: true,
        }).catch(err => console.log(err.message));

        await FDTaskConfig.destroy({
            where: {
                taskID: uuid,
            },
            force: true,
        }).catch(err => console.log(err.message));
    } else if (primitive === "AR") {
        await ARTaskResult.destroy({
            where: {
                taskID: uuid,
            },
            force: true,
        }).catch(err => console.log(err.message));

        await ARTaskConfig.destroy({
            where: {
                taskID: uuid,
            },
            force: true,
        }).catch(err => console.log(err.message));
    }

};

export const getFilteredDeps = async <T>(taskID: string, filter: taskInfoVariables["filter"]) => {
    const result = await testQuery<taskInfo, taskInfoVariables>({
        dirname: __dirname,
        queryName: "taskInfo",
        variables: {
            taskID: taskID,
            filter: filter,
        },
    });

    return getDepsWithTyping(result.data)  as Array<T>;
};

export const waitWileTaskFinishes = async (taskID: string, numberOfTries = 3) => {

    for (let i = 0; i < numberOfTries; ++i) {
        const result = await models.TaskState.findByPk(taskID);
        if (result?.status == "COMPLETED") {
            break;
        } else {
            await sleep(1000);
        }
    }
};


