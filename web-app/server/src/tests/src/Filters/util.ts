import { testQuery } from "../../util";
import models from "../../../db/models";
import { FDTaskResult } from "../../../db/models/TaskData/results/TasksWithDeps";
import { taskInfo, taskInfoVariables } from "./queries/__generated__/taskInfo";

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

export const compare = (str1: string, str2: string): number => {
    if (str1 < str2) {
        return -1;
    } else if (str1 > str2) {
        return 1;
    } else {
        return 0;
    }
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


