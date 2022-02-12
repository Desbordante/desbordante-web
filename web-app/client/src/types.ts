import {
  taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs,
  taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs,
} from "./operations/queries/__generated__/taskInfo";

export type attribute = {
  column: { name: string; index?: number };
  value: number;
};
export type pieChartData = {
  lhs:
    | taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs[];
  rhs:
    | taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs[];
};
export type dependencyEncoded = { lhs: number[]; rhs: number };
export type dependency = { lhs: string[]; rhs: string };
export type taskStatus =
  | "UNSCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "SERVER ERROR"
  | "INCORRECT INPUT DATA";
export type parameters = {
  algName: string;
  separator: string;
  errorPercent: number;
  hasHeader: boolean;
  maxLHS: number;
};
export type FDAlgorithm = {
  name: string;
  properties: {
    hasArityConstraint: boolean;
    hasErrorThreshold: boolean;
    isMultiThreaded: boolean;
  };
};
export type user = {
  name: string;
  email: string;
  isAdmin: boolean;
};
export type tableInfo = {
  ID: string;
  fileName: string;
  hasHeader: boolean;
  delimiter: string;
};
export type error = {
  code?: number;
  message: string;
  suggestion?: string;
};
export type builtinDataset = {
  fileName: string;
  ID: string;
};
