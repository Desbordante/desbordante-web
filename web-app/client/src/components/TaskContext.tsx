import { useLazyQuery, useMutation } from "@apollo/client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DELETE_TASK } from "../graphql/operations/mutations/deleteTask";
import {
  deleteTask,
  deleteTaskVariables,
} from "../graphql/operations/mutations/__generated__/deleteTask";

import { GET_TASK_INFO } from "../graphql/operations/queries/getTaskInfo";
import {
  getTaskInfo,
  getTaskInfo_taskInfo_data_FDTask,
  getTaskInfo_taskInfo_data_CFDTask,
  getTaskInfoVariables,
} from "../graphql/operations/queries/__generated__/getTaskInfo";
import { PrimitiveType } from "../types/types";
import { ErrorContext } from "./ErrorContext";
import { Dataset, TaskResult, TaskState } from "../types/taskInfo";
import parseFunctionalDependency from "../functions/parseDependency";

type TaskContextType = {
  taskId: string | undefined;
  setTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
  taskState: TaskState | undefined;
  dataset: Dataset | undefined;
  taskType: PrimitiveType | undefined;
  taskResult: TaskResult | undefined;
  resetTask: () => void;
  deleteTask: () => Promise<any>;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskContextProvider: React.FC = ({ children }) => {
  const { showError } = useContext(ErrorContext)!;

  const [taskId, setTaskId] = useState<string>();
  const [dataset, setDataset] = useState<Dataset>();
  const [taskState, setTaskState] = useState<TaskState>();
  const [taskType, setTaskType] = useState<PrimitiveType>();
  const [taskResult, setTaskResult] = useState<TaskResult>();

  const resetTask = async () => {
    setTaskId(undefined);
    setTaskState(undefined);
    setDataset(undefined);
    setTaskResult(undefined);
  };

  const [query, { data: taskData, error }] = useLazyQuery<
    getTaskInfo,
    getTaskInfoVariables
  >(GET_TASK_INFO);
  const [deleteTask, { error: deleteError }] = useMutation<
    deleteTask,
    deleteTaskVariables
  >(DELETE_TASK, { variables: { taskID: taskId! } });

  const queryRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    queryRef.current = setInterval(
      () => taskId && query({ variables: { taskID: taskId } }),
      500
    );
  }, [taskId, query]);

  useEffect(() => {
    if (!taskId || taskState?.isExecuted || error) {
      clearInterval(queryRef.current!);
    }
  }, [taskId, taskState, error]);

  useEffect(() => {
    if (taskData) {
      const { state, data, dataset: taskDataset } = taskData.taskInfo;
      setTaskState(state);

      setDataset({
        fileName: taskDataset.tableInfo.originalFileName,
        snippet: taskDataset.snippet,
      });

      // eslint-disable-next-line no-underscore-dangle
      switch (data?.__typename) {
        case "FDTask": {
          const result = (data as getTaskInfo_taskInfo_data_FDTask).FDResult;
          if (result) {
            setTaskType("Functional Dependencies");
            setTaskResult({
              FD: {
                pieChartData: result.pieChartData,
                dependencies: result.FDs?.map((dep) =>
                  parseFunctionalDependency(dep, taskDataset.snippet.header)
                ),
                keys: result?.PKs?.map((attr) => attr?.name!),
              },
            });
          }
          return;
        }

        case "CFDTask": {
          const result = (data as getTaskInfo_taskInfo_data_CFDTask).CFDResult;
          if (result) {
            setTaskType("Conditional Functional Dependencies");
            setTaskResult({
              CFD: {
                pieChartData: result.pieChartData,
                dependencies: result.CFDs?.map((cfd) => ({
                  lhsPatterns: cfd.lhsPatterns,
                  rhsPattern: cfd.rhsPattern,
                  fd: parseFunctionalDependency(
                    cfd?.fd,
                    taskDataset.snippet.header
                  ),
                })),
                keys: result.PKs?.map((attr) => attr?.name),
              },
            });
          }
          return;
        }

        default: {
          showError({ message: "Server error" });
        }
      }
    }
  }, [taskData]);

  useEffect(() => {
    if (error) {
      showError({ message: error.message });
    }
  }, [showError, error]);

  useEffect(() => {
    if (deleteError) {
      showError({ message: deleteError.message });
    }
  }, [showError, deleteError]);

  const outValue = {
    taskId,
    setTaskId,
    taskState,
    dataset,
    taskType,
    taskResult,
    resetTask,
    deleteTask,
  };

  return (
    <TaskContext.Provider value={outValue}>{children}</TaskContext.Provider>
  );
};
