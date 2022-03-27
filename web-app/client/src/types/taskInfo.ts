import {
  getTaskInfo_taskInfo_state,
  getTaskInfo_taskInfo_state_TaskState,
} from "../graphql/operations/queries/__generated__/getTaskInfo";
import { getDataset_taskInfo_dataset } from "../graphql/operations/queries/__generated__/getDataset";
import {
  getFDs_taskInfo_data_result_FDTaskResult,
  getFDs_taskInfo_data_result_FDTaskResult_pieChartData,
  getFDs_taskInfo_data_result_FDTaskResult_PKs,
} from "../graphql/operations/queries/primitives/__generated__/getFDs";
import { Column } from "../graphql/operations/fragments/__generated__/Column";
import {
  getCFDs_taskInfo_data_result_CFDTaskResult,
  getCFDs_taskInfo_data_result_CFDTaskResult_CFDs,
  getCFDs_taskInfo_data_result_CFDTaskResult_pieChartData,
} from "../graphql/operations/queries/primitives/__generated__/getCFDs";
import { PrimitiveType } from "./globalTypes";
import { getARs_taskInfo_data_result_ARTaskResult } from "../graphql/operations/queries/primitives/__generated__/getARs";

export type Dataset = getDataset_taskInfo_dataset;

export type TaskStateAnswer = getTaskInfo_taskInfo_state;
export type TaskState = getTaskInfo_taskInfo_state_TaskState;

export type FDPieChartData =
  getFDs_taskInfo_data_result_FDTaskResult_pieChartData;
export type FunctionalDependency = getFDs_taskInfo_data_result_FDTaskResult;
export type FDAttribute = Column;

export type CFDPieChartData =
  getCFDs_taskInfo_data_result_CFDTaskResult_pieChartData;
export type ConditionalDependency =
  getCFDs_taskInfo_data_result_CFDTaskResult_CFDs;

export type FDTaskResult = getFDs_taskInfo_data_result_FDTaskResult;

export type CFDTaskResult = getCFDs_taskInfo_data_result_CFDTaskResult;

export type ARTaskResult = getARs_taskInfo_data_result_ARTaskResult;

export type TaskResult = {
  [PrimitiveType.FD]?: FDTaskResult;
  [PrimitiveType.CFD]?: CFDTaskResult;
  [PrimitiveType.AR]?: ARTaskResult;
};

export type SortMethod<T> = {
  name: string;
  comparator: (a: T, b: T) => number;
};

export type Dependency = FunctionalDependency | ConditionalDependency;

export type Key = getFDs_taskInfo_data_result_FDTaskResult_PKs;
