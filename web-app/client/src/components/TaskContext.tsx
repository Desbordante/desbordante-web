import React, {createContext, useCallback, useState} from "react";

import {
  Dataset,
  PieChartData, TaskProperties,
  TaskResult,
  TaskStateAnswer,
} from "../types/taskInfo";
import {IntersectionFilter, Pagination, PrimitiveType} from "../types/globalTypes";
import {useTaskInfo} from "../hooks/useTaskInfo";
import {usePrimitiveList} from "../hooks/usePrimitiveList";
import {useDataset} from "../hooks/useDataset";
import {useDeleteTask} from "../hooks/useDeleteTask";
import {
  defaultDatasetPagination, defaultIntersectionFilter
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
  intersectionFilter: IntersectionFilter;
  setIntersectionFilter: React.Dispatch<React.SetStateAction<IntersectionFilter>>;
  setFilterParams: (params: Partial<IntersectionFilter>) => void
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskContextProvider: React.FC = ({children}) => {
  const [taskId, setTaskId] = useState<string>();
  const [intersectionFilter, setIntersectionFilter] = useState<IntersectionFilter>(
    defaultIntersectionFilter
  );
  const [datasetPagination, setDatasetPagination] = useState<Pagination>(
    defaultDatasetPagination
  );

  const {taskState, taskType, taskProperties} = useTaskInfo(taskId);
  const {taskResult, loading: taskResultLoading} = usePrimitiveList(
    taskId,
    taskType,
    intersectionFilter,
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

  const setFilterParams = (params: Partial<IntersectionFilter>) =>
    setIntersectionFilter((filter) => ({...filter, ...params}));

  const outValue = {
    taskId,
    setTaskId,
    taskState,
    taskType,
    taskProperties,
    intersectionFilter,
    setIntersectionFilter,
    setFilterParams,
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
