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
import { getTaskInfo, getTaskInfoVariables } from "../graphql/operations/queries/__generated__/getTaskInfo";
import { ErrorContext } from "./ErrorContext";
import { Dataset, FDTaskResult, TaskResult, TaskStateAnswer } from "../types/taskInfo";
import { PrimitiveType } from "../types/globalTypes";

type TaskContextType = {
  taskId: string | undefined;
  setTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
  taskState: TaskStateAnswer | undefined;
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
  const [taskState, setTaskState] = useState<TaskStateAnswer>();
  const [taskType, setTaskType] = useState<PrimitiveType>();
  const [taskResult, setTaskResult] = useState<TaskResult>();

  const resetTask = async () => {
    setTaskId(undefined);
    setTaskState(undefined);
    setDataset(undefined);
    setTaskResult(undefined);
  };

  const [query, { data: taskData, error }] =
      useLazyQuery<getTaskInfo, getTaskInfoVariables>(GET_TASK_INFO);

  const [deleteTask, { error: deleteError }]
      = useMutation <deleteTask, deleteTaskVariables>(
          DELETE_TASK,
      { variables: { taskID: taskId! } });

  const queryRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (!queryRef.current && taskId) {
      queryRef.current = setInterval(
        () => query({ variables: { taskID: taskId } }),
        500
      );
    }
  }, [taskId]);

  useEffect(() => {
    if (queryRef.current && (!taskId || taskState && "processStatus" in taskState && taskState.isExecuted || error)) {
      clearInterval(queryRef.current);
      queryRef.current = null;
    }
  }, [taskId, taskState, error]);

  useEffect(() => {
    if (taskData) {
      const { state, data, dataset: taskDataset } = taskData.taskInfo;
      setTaskState(state);
      setDataset(taskDataset);

      // eslint-disable-next-line no-underscore-dangle
      switch (data?.result?.__typename) {
        case "FDTaskResult": {
          const { result } = data;
          if (result) {
            setTaskType(PrimitiveType.FD);
            setTaskResult({
              FD: result,
            });
          }
          return;
        }

        case "CFDTaskResult": {
          const { result } = data;
          if (result) {
            setTaskType(PrimitiveType.CFD);
            setTaskResult({
              CFD: result,
            });
          }
          return;
        }

        case "ARTaskResult": {
          const { result } = data;
          if (result) {
            setTaskType(PrimitiveType.AR);
            setTaskResult({
              AR: result,
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
