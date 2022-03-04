import {
  getTaskInfo_taskInfo_data_CFDTask_CFDResult_pieChartData,
  getTaskInfo_taskInfo_data_FDTask_FDResult_pieChartData,
  getTaskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs,
  getTaskInfo_taskInfo_state,
} from "../graphql/operations/queries/__generated__/getTaskInfo";

export type Dataset = {
  fileName: string;
  snippet: {
    header: string[];
    rows: string[][] | null;
  };
};

export type TaskState = getTaskInfo_taskInfo_state;

export type FDPieChartData =
  getTaskInfo_taskInfo_data_FDTask_FDResult_pieChartData;
export type FunctionalDependency = {
  lhs: string[];
  rhs: string;
};
export type FDAttribute =
  getTaskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs;

export type CFDPieChartData =
  getTaskInfo_taskInfo_data_CFDTask_CFDResult_pieChartData;
export type ConditionalDependency = {
  lhs: string[];
  rhs: string;
  lhsPatterns: string[];
  rhsPattern: string;
};

export type FDTaskResult = {
  dependencies: FunctionalDependency[];
  pieChartData: FDPieChartData;
  keys: string[];
};

export type CFDTaskResult = {
  dependencies: ConditionalDependency[];
  pieChartData: CFDPieChartData;
  keys: string[];
};

export type TaskResult = {
  FD?: FDTaskResult;
  CFD?: CFDTaskResult;
};

export type SortMethod<T> = {
  name: string;
  comparator: (a: T, b: T) => number;
};

export type Dependency = FunctionalDependency | ConditionalDependency;
