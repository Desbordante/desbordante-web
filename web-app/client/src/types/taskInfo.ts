import {
  getTaskInfo_taskInfo_data_result_ARTaskResult,
  getTaskInfo_taskInfo_data_result_CFDTaskResult,
  getTaskInfo_taskInfo_data_result_CFDTaskResult_CFDs,
  getTaskInfo_taskInfo_data_result_CFDTaskResult_pieChartData,
  getTaskInfo_taskInfo_data_result_FDTaskResult,
  getTaskInfo_taskInfo_data_result_FDTaskResult_FDs,
  getTaskInfo_taskInfo_data_result_FDTaskResult_pieChartData,
  getTaskInfo_taskInfo_data_result_FDTaskResult_pieChartData_lhs,
  getTaskInfo_taskInfo_data_result_FDTaskResult_PKs,
  getTaskInfo_taskInfo_dataset,
  getTaskInfo_taskInfo_state, getTaskInfo_taskInfo_state_TaskState,
} from "../graphql/operations/queries/__generated__/getTaskInfo";

export type Dataset = getTaskInfo_taskInfo_dataset;

export type TaskStateAnswer = getTaskInfo_taskInfo_state
export type TaskState = getTaskInfo_taskInfo_state_TaskState;

export type FDPieChartData =
  getTaskInfo_taskInfo_data_result_FDTaskResult_pieChartData;
export type FunctionalDependency =
  getTaskInfo_taskInfo_data_result_FDTaskResult_FDs;
export type FDAttribute =
  getTaskInfo_taskInfo_data_result_FDTaskResult_pieChartData_lhs;

export type CFDPieChartData =
  getTaskInfo_taskInfo_data_result_CFDTaskResult_pieChartData;
export type ConditionalDependency =
  getTaskInfo_taskInfo_data_result_CFDTaskResult_CFDs;

export type FDTaskResult = getTaskInfo_taskInfo_data_result_FDTaskResult;

export type CFDTaskResult = getTaskInfo_taskInfo_data_result_CFDTaskResult;

export type ARTaskResult = getTaskInfo_taskInfo_data_result_ARTaskResult;

export type TaskResult = {
  FD?: FDTaskResult;
  CFD?: CFDTaskResult;
  AR?: ARTaskResult;
};

export type SortMethod<T> = {
  name: string;
  comparator: (a: T, b: T) => number;
};

export type Dependency = FunctionalDependency | ConditionalDependency;

export type Key = getTaskInfo_taskInfo_data_result_FDTaskResult_PKs;
