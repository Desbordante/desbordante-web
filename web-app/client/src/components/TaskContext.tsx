import React, { createContext, useState } from "react";

import { Dataset, TaskResult, TaskStateAnswer } from "../types/taskInfo";
import { Pagination, PrimitiveType } from "../types/globalTypes";
import { useTaskInfo } from "../hooks/useTaskInfo";
import { PrimitiveFilter } from "../types/primitives";
import { useTaskResult } from "../hooks/useTaskResult";
import { useDataset } from "../hooks/useDataset";
import { useDeleteTask } from "../hooks/useDeleteTask";

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
  const [taskId, setTaskId] = useState<string>();
  const [primitiveFilter, setPrimitiveFilter] = useState<PrimitiveFilter>();
  const [datasetPagination, setDatasetPagination] = useState<Pagination>();

  const { taskState, taskType } = useTaskInfo(taskId);
  const { taskResult, loading: taskResultLoading } = useTaskResult(
    taskId,
    taskType,
    primitiveFilter
  );
  const { dataset, loading: datasetLoading } = useDataset(
    taskId,
    datasetPagination
  );
  const { deleteTask, loading: deleteTaskLoading } = useDeleteTask(taskId);

  const resetTask = async () => {
    setTaskId(undefined);
  };

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
