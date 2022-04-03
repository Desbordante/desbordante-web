import {
  getTaskInfo_taskInfo_state,
  getTaskInfo_taskInfo_state_TaskState,
} from "../graphql/operations/queries/__generated__/getTaskInfo";
import { getDataset_taskInfo_dataset } from "../graphql/operations/queries/__generated__/getDataset";
import {
  getFDs_taskInfo_data_result_FDTaskResult,
  getFDs_taskInfo_data_result_FDTaskResult_FDs,
} from "../graphql/operations/queries/FD/__generated__/getFDs";
import {
  getFDsPieChartData_taskInfo_data_result_FDTaskResult_pieChartData,
  getFDsPieChartData_taskInfo_data_result_FDTaskResult_pieChartData_lhs,
} from "../graphql/operations/queries/FD/__generated__/getFDsPieChartData";
import {
  getCFDs_taskInfo_data_result_CFDTaskResult,
  getCFDs_taskInfo_data_result_CFDTaskResult_CFDs,
} from "../graphql/operations/queries/CFD/__generated__/getCFDs";
import { getCFDsPieChartData_taskInfo_data_result_CFDTaskResult_pieChartData } from "../graphql/operations/queries/CFD/__generated__/getCFDsPieChartData";
import { PrimitiveType } from "./globalTypes";
import { getARs_taskInfo_data_result_ARTaskResult } from "../graphql/operations/queries/AR/__generated__/getARs";

export type Dataset = getDataset_taskInfo_dataset;

export type TaskStateAnswer = getTaskInfo_taskInfo_state;
export type TaskState = getTaskInfo_taskInfo_state_TaskState;

export type FDPieChartData =
  getFDsPieChartData_taskInfo_data_result_FDTaskResult_pieChartData;
export type FunctionalDependency = getFDs_taskInfo_data_result_FDTaskResult_FDs;
export type FDAttribute =
  getFDsPieChartData_taskInfo_data_result_FDTaskResult_pieChartData_lhs;

export type CFDPieChartData =
  getCFDsPieChartData_taskInfo_data_result_CFDTaskResult_pieChartData;
export type ConditionalDependency =
  getCFDs_taskInfo_data_result_CFDTaskResult_CFDs;

export type FDTaskResult = getFDs_taskInfo_data_result_FDTaskResult;

export type CFDTaskResult = getCFDs_taskInfo_data_result_CFDTaskResult;

export type ARTaskResult = getARs_taskInfo_data_result_ARTaskResult;

export type TaskResult = {
  FD?: FDTaskResult;
  CFD?: CFDTaskResult;
  AR?: ARTaskResult;
};

export type PieChartData = {
  FD?: FDPieChartData;
  CFD?: CFDPieChartData;
};

export type SortMethod<T> = {
  name: string;
  comparator: (a: T, b: T) => number;
};

export type Dependency = FunctionalDependency | ConditionalDependency;
