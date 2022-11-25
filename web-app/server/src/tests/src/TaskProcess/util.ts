import { isMainPrimitiveType } from "../../../db/models/TaskData/configs/GeneralTaskConfig";
import { TypoClusterTaskResult } from "../../__generated__/types";
import {
    CheckTaskState,
    CheckTaskStateVariables,
} from "./queries/__generated__/CheckTaskState";
import {
    CreateMainTask,
    CreateMainTaskVariables,
} from "./queries/__generated__/CreateMainTask";
import {
    CreateSpecificTask,
    CreateSpecificTaskVariables,
} from "./queries/__generated__/CreateSpecificTask";
import { ServerInfo, executeOperation, getTestServer } from "../../util";
import {
    GetMainTaskDeps,
    GetMainTaskDepsVariables,
} from "./queries/__generated__/GetMainTaskDeps";
import {
    GetSpecificCluster,
    GetSpecificClusterVariables,
} from "./queries/__generated__/GetSpecificCluster";
import {
    GetTypoClusters,
    GetTypoClustersVariables,
} from "./queries/__generated__/GetTypoClusters";

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type TaskProcessingFunction<ParamsType, ReturnType> = (
    serverInfo: ServerInfo,
    params: ParamsType
) => Promise<ReturnType>;

type CreateMainTaskProps = Omit<CreateMainTaskVariables, "fileID"> & { fileName: string };
type CreateSpecificTaskProps = CreateSpecificTaskVariables;
type CreateTaskProps = CreateMainTaskProps | CreateSpecificTaskProps;

export const createTask: TaskProcessingFunction<
    CreateTaskProps,
    | CreateMainTask["createMainTaskWithDatasetChoosing"]
    | CreateSpecificTask["createSpecificTask"]
> = async (serverInfo, params) => {
    const isMainTask = (params: CreateTaskProps): params is CreateMainTaskProps => {
        return isMainPrimitiveType(params.props.type);
    };
    if (isMainTask(params)) {
        return await createMainTask(serverInfo, params);
    } else {
        return await createSpecificTask(serverInfo, params);
    }
};

export const createMainTask: TaskProcessingFunction<
    CreateMainTaskProps,
    CreateMainTask["createMainTaskWithDatasetChoosing"]
> = async (serverInfo, { fileName, props }) => {
    const { context } = serverInfo;
    const { models } = context;

    const file = await models.FileInfo.findBuiltInDataset(fileName);

    expect(file).toBeDefined();

    const { fileID } = file;
    const createMainTask = await executeOperation<
        CreateMainTask,
        CreateMainTaskVariables
    >(serverInfo, {
        dirname: __dirname,
        queryName: "CreateMainTask",
        variables: { fileID, props },
    });
    expect(createMainTask.data).toBeDefined();
    const { createMainTaskWithDatasetChoosing } = createMainTask.data;
    expect(createMainTaskWithDatasetChoosing.taskID).toBeDefined();

    return createMainTaskWithDatasetChoosing;
};

export const createSpecificTask: TaskProcessingFunction<
    CreateSpecificTaskProps,
    CreateSpecificTask["createSpecificTask"]
> = async (serverInfo, { props }) => {
    const createTask = await executeOperation<
        CreateSpecificTask,
        CreateSpecificTaskVariables
    >(serverInfo, {
        dirname: __dirname,
        queryName: "CreateSpecificTask",
        variables: { props },
    });
    expect(createTask.data).toBeDefined();
    const { createSpecificTask } = createTask.data;
    expect(createSpecificTask.taskID).toBeDefined();

    return createSpecificTask;
};

export const getTaskState: TaskProcessingFunction<
    CheckTaskStateVariables,
    CheckTaskState["taskInfo"]["state"]
> = async (serverInfo, variables) => {
    const { data } = await executeOperation<CheckTaskState, CheckTaskStateVariables>(
        serverInfo,
        {
            variables,
            dirname: __dirname,
            queryName: "CheckTaskState",
        }
    );
    expect(data).toBeDefined();
    return data.taskInfo.state;
};

export const waitWhileTaskIsRunning: TaskProcessingFunction<
    Parameters<typeof getTaskState>[1],
    ReturnType<typeof getTaskState>
> = async (serverInfo, variables): Promise<ReturnType<typeof getTaskState>> => {
    const state = await getTaskState(serverInfo, variables);
    expect(state.__typename).toBe("TaskState");
    if (state.__typename !== "TaskState") {
        throw new Error("Error during task execution");
    }
    if (state.isExecuted) {
        expect(state.isExecuted).toBe(true);
        expect(state.currentPhase).toBe(state.maxPhase);
        expect(state.currentPhase).toBeGreaterThan(0);
        expect(state.isPrivate).toBe(false);
        return state;
    }
    return await sleep(100).then(() => waitWhileTaskIsRunning(serverInfo, variables));
};

export const getTasksResults: TaskProcessingFunction<
    GetMainTaskDepsVariables,
    NonNullable<GetMainTaskDeps["taskInfo"]["data"]["result"]>
> = async (serverInfo, { taskID, filter }) => {
    const getTaskResult = await executeOperation<
        GetMainTaskDeps,
        GetMainTaskDepsVariables
    >(serverInfo, {
        dirname: __dirname,
        queryName: "GetMainTaskDeps",
        variables: {
            taskID,
            filter,
        },
    });
    const { data } = getTaskResult;

    const { result } = data.taskInfo.data;
    expect(result).toBeDefined();
    if (result == null) {
        throw new Error("Result is undefined");
    }
    return result;
};

export const getTypoClusters: TaskProcessingFunction<
    GetTypoClustersVariables,
    Omit<TypoClusterTaskResult, "specificCluster">
> = async (serverInfo, variables) => {
    const getTypoClusters = await executeOperation<
        GetTypoClusters,
        GetTypoClustersVariables
    >(serverInfo, {
        dirname: __dirname,
        queryName: "GetTypoClusters",
        variables,
    });
    const {
        data: { taskInfo },
    } = getTypoClusters;

    const expectedTypename = "SpecificTaskInfo";
    expect(taskInfo.__typename).toBe(expectedTypename);
    if (taskInfo.__typename !== expectedTypename) {
        throw new Error(`Expected ${expectedTypename}`);
    }
    const {
        data: { result },
    } = taskInfo;
    expect(result).toBeDefined();
    if (result == null) {
        throw new Error("Result is undefined");
    }
    return result;
};

export const waitWhileSpecificCLusterMiningIsRunning: TaskProcessingFunction<
    Parameters<typeof getTaskState>[1],
    ReturnType<typeof getTaskState>
> = async (serverInfo, variables): Promise<ReturnType<typeof getTaskState>> => {
    const state = await getTaskState(serverInfo, variables);
    expect(state.__typename).toBe("TaskState");
    if (state.__typename !== "TaskState") {
        throw new Error("Error during task execution");
    }
    if (state.isExecuted) {
        expect(state.isExecuted).toBe(true);
        expect(state.currentPhase).toBe(state.maxPhase);
        expect(state.currentPhase).toBeGreaterThan(0);
        expect(state.isPrivate).toBe(false);
        return state;
    }
    return await sleep(100).then(() => waitWhileTaskIsRunning(serverInfo, variables));
};

export const getSpecificCluster: TaskProcessingFunction<
    GetSpecificClusterVariables,
    void
> = async (serverInfo, variables) => {
    const isExecuted = false;
    while (!isExecuted) {
        await (async () => {
            const getSpecificCluster = await executeOperation<
                GetSpecificCluster,
                GetSpecificClusterVariables
            >(serverInfo, {
                dirname: __dirname,
                queryName: "GetSpecificCluster",
                variables,
            });
            const {
                data: { taskInfo },
            } = getSpecificCluster;

            const expectedTypename = "SpecificTaskInfo";
            expect(taskInfo.__typename).toBe(expectedTypename);
            if (taskInfo.__typename !== expectedTypename) {
                throw new Error(`Expected ${expectedTypename}`);
            }
            const {
                data: { result },
            } = taskInfo;
            if (!result) {
                throw Error("result is undefined");
            }
            if (
                result.specificCluster.__typename === "Cluster" ||
                result.specificCluster.__typename === "SquashedCluster"
            ) {
                serverInfo.context.logger(result.specificCluster.clusterID);
                serverInfo.context.logger(result.specificCluster.itemsAmount);
                serverInfo.context.logger(result.specificCluster.items);
            }
            await sleep(200);
        })();
    }
    // if (
    //     result.specificCluster.__typename === "Cluster" ||
    //     result.specificCluster.__typename === "SquashedCluster"
    // ) {
    //     serverInfo.context.logger(result.specificCluster.clusterID);
    //     serverInfo.context.logger(result.specificCluster.itemsAmount);
    //     serverInfo.context.logger(result.specificCluster.items);
    // }
    // return result;
};

export const testTaskWithDeps = async (
    params: Parameters<typeof createMainTask>[1],
    filter: Parameters<typeof getTasksResults>[1]["filter"],
    expected: { filteredDepsAmount: number; depsAmount: number }
) => {
    const { type } = params.props;
    if (!isMainPrimitiveType(type)) {
        throw new Error("Expected another type");
    }
    const serverInfo = await getTestServer();

    const { taskID } = await createTask(serverInfo, params);
    await waitWhileTaskIsRunning(serverInfo, { taskID });
    const result = await getTasksResults(serverInfo, { taskID, filter });

    expect(result.__typename).toBe(`${type}TaskResult` as const);
    if (result.__typename !== (`${type}TaskResult` as const)) {
        throw new Error("Received incorrect result type");
    }
    expect(result.depsAmount).toBe(expected.depsAmount);
    const { filteredDepsAmount } = result.filteredDeps;
    const deps = (() => {
        switch (result.filteredDeps.__typename) {
            case "FilteredFDs":
                return result.filteredDeps.FDs;
            case "FilteredARs":
                return result.filteredDeps.ARs;
            case "FilteredCFDs":
                return result.filteredDeps.CFDs;
        }
        throw new Error("Unreachable code");
    })();

    expect(filteredDepsAmount).toBe(expected.filteredDepsAmount);
    expect(deps.length).toBeLessThanOrEqual(filter.pagination.limit);
    return { taskID, deps };
};
