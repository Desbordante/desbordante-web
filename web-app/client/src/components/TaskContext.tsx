import React, {createContext, useCallback, useState} from "react";

import {
  Dataset,
  PieChartData, TaskProperties,
  TaskResult,
  TaskStateAnswer,
} from "../types/taskInfo";
import {Pagination, PrimitiveType} from "../types/globalTypes";
import {useTaskInfo} from "../hooks/useTaskInfo";
import {PrimitiveFilter} from "../types/primitives";
import {usePrimitiveList} from "../hooks/usePrimitiveList";
import {useDataset} from "../hooks/useDataset";
import {useDeleteTask} from "../hooks/useDeleteTask";
import {
  defaultDatasetPagination,
  defaultPrimitiveFilter,
} from "../constants/primitives";
import {usePieChartData} from "../hooks/usePieChartData";

type TaskContextType = {
  taskId: string | undefined;
  setTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
  taskState: TaskStateAnswer | undefined;
  taskProperties: TaskProperties | undefined;
  dataset: Dataset | undefined;
  datasetLoading: boolean;
  taskType: PrimitiveType | undefined;
  taskResult: TaskResult | undefined;
  taskResultLoading: boolean;
  pieChartData: PieChartData | undefined;
  pieChartDataLoading: boolean;
  resetTask: () => void;
  deleteTask: () => Promise<any>;
  primitiveFilter: PrimitiveFilter;
  setPrimitiveFilter: React.Dispatch<React.SetStateAction<PrimitiveFilter>>;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskContextProvider: React.FC = ({children}) => {
  const [taskId, setTaskId] = useState<string>();
  const [primitiveFilter, setPrimitiveFilter] = useState<PrimitiveFilter>(
    defaultPrimitiveFilter
  );
  const [datasetPagination, setDatasetPagination] = useState<Pagination>(
    defaultDatasetPagination
  );

  const {taskState, taskType, taskProperties} = useTaskInfo(taskId);
  const {taskResult, loading: taskResultLoading} = usePrimitiveList(
    taskId,
    taskType,
    primitiveFilter,
    taskState?.isExecuted
  );
  const {pieChartData, loading: pieChartDataLoading} = usePieChartData(
    taskId,
    taskType,
    taskState?.isExecuted
  );
  const {dataset, loading: datasetLoading} = useDataset(
    taskId,
    datasetPagination
  );
  const {deleteTask, loading: deleteTaskLoading} = useDeleteTask(taskId);

  const resetTask = useCallback(async () => {
    setTaskId(undefined);
  }, []);

  const outValue = {
    taskId,
    setTaskId,
    taskState,
    taskType,
    taskProperties,
    primitiveFilter,
    setPrimitiveFilter,
    datasetPagination,
    setDatasetPagination,
    taskResult,
    taskResultLoading,
    pieChartData,
    pieChartDataLoading,
    dataset,
    datasetLoading,
    resetTask,
    deleteTask,
    deleteTaskLoading,
  };

  return (
    <TaskContext.Provider value={outValue}>{children}</TaskContext.Provider>
  );
};
