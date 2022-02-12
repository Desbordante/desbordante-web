/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: taskInfo
// ====================================================

export interface taskInfo_taskInfo_state {
  __typename: "TaskState";
  status: string;
  phaseName: string | null;
  currentPhase: number | null;
  progress: number;
  maxPhase: number | null;
  errorMsg: string | null;
  isExecuted: boolean;
}

export interface taskInfo_taskInfo_data_CFDTask {
  __typename: "CFDTask";
}

export interface taskInfo_taskInfo_data_FDTask_result_FDs {
  __typename: "FD";
  lhs: number[];
  rhs: number;
}

export interface taskInfo_taskInfo_data_FDTask_result_PKs {
  __typename: "Column";
  name: string;
}

export interface taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs_column {
  __typename: "Column";
  name: string;
}

export interface taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs {
  __typename: "FDPieChartRow";
  column: taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs_column;
  value: number;
}

export interface taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs_column {
  __typename: "Column";
  name: string;
}

export interface taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs {
  __typename: "FDPieChartRow";
  column: taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs_column;
  value: number;
}

export interface taskInfo_taskInfo_data_FDTask_result_pieChartData {
  __typename: "FDPieChart";
  lhs: (taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs | null)[] | null;
  rhs: (taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs | null)[] | null;
}

export interface taskInfo_taskInfo_data_FDTask_result {
  __typename: "FDResult";
  FDs: (taskInfo_taskInfo_data_FDTask_result_FDs | null)[] | null;
  PKs: (taskInfo_taskInfo_data_FDTask_result_PKs | null)[] | null;
  pieChartData: taskInfo_taskInfo_data_FDTask_result_pieChartData | null;
}

export interface taskInfo_taskInfo_data_FDTask {
  __typename: "FDTask";
  result: taskInfo_taskInfo_data_FDTask_result | null;
}

export type taskInfo_taskInfo_data = taskInfo_taskInfo_data_CFDTask | taskInfo_taskInfo_data_FDTask;

export interface taskInfo_taskInfo_dataset_tableInfo {
  __typename: "TableInfo";
  originalFileName: string;
}

export interface taskInfo_taskInfo_dataset_snippet {
  __typename: "Snippet";
  header: (string | null)[];
  rows: string[][] | null;
}

export interface taskInfo_taskInfo_dataset {
  __typename: "DatasetInfo";
  tableInfo: taskInfo_taskInfo_dataset_tableInfo;
  snippet: taskInfo_taskInfo_dataset_snippet;
}

export interface taskInfo_taskInfo {
  __typename: "TaskInfo";
  state: taskInfo_taskInfo_state;
  data: taskInfo_taskInfo_data | null;
  dataset: taskInfo_taskInfo_dataset;
}

export interface taskInfo {
  taskInfo: taskInfo_taskInfo;
}

export interface taskInfoVariables {
  id: string;
}
