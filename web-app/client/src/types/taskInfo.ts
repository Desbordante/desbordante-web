import {
  getTaskInfo_taskInfo_data_specificConfig,
  getTaskInfo_taskInfo_state,
  getTaskInfo_taskInfo_state_TaskState,
} from "../graphql/operations/queries/__generated__/getTaskInfo";
import {getDataset_taskInfo_dataset} from "../graphql/operations/queries/__generated__/getDataset";
import {GetMainTaskDeps_taskInfo_TaskInfo_data_result} from "../graphql/operations/queries/__generated__/GetMainTaskDeps";
import {MainPrimitiveType, PrimitiveType} from "./globalTypes";
import {
  getPieChartData_taskInfo_data_TaskWithDepsData_pieChartData_CFDTaskResult,
  getPieChartData_taskInfo_data_TaskWithDepsData_pieChartData_FDTaskResult,
  getPieChartData_taskInfo_data_TaskWithDepsData_pieChartData_FDTaskResult_FD_withoutPatterns_lhs
} from "../graphql/operations/queries/__generated__/getPieChartData";

export type Dataset = getDataset_taskInfo_dataset;

export type TaskStateAnswer = getTaskInfo_taskInfo_state;
export type TaskState = getTaskInfo_taskInfo_state_TaskState;

export type TaskProperties = {
  algorithmName: string;
  specificConfig: getTaskInfo_taskInfo_data_specificConfig;
}

export type TaskResult = GetMainTaskDeps_taskInfo_TaskInfo_data_result;

export const primitivesWithPieChartData = [MainPrimitiveType.FD, MainPrimitiveType.CFD] as const;
export type PrimitiveWithChartsType = typeof primitivesWithPieChartData[number];
export const isPrimitiveWithPieChartData = (type: MainPrimitiveType): type is PrimitiveWithChartsType =>
    primitivesWithPieChartData.includes(type as unknown as PrimitiveWithChartsType);

// @ts-ignore
export const isMainPrimitiveType = (type: PrimitiveType): type is MainPrimitiveType => type !== "TypoCluster"

export type PieChartData = getPieChartData_taskInfo_data_TaskWithDepsData_pieChartData_FDTaskResult | getPieChartData_taskInfo_data_TaskWithDepsData_pieChartData_CFDTaskResult;

export type SortMethod<T> = {
  name: string;
  comparator: (a: T, b: T) => number;
};

export type FDAttribute =
  getPieChartData_taskInfo_data_TaskWithDepsData_pieChartData_FDTaskResult_FD_withoutPatterns_lhs;
