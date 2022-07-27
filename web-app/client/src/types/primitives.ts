import {getClustersPreview_taskInfo_data_SpecificTaskData_result_typoClusters} from "../graphql/operations/queries/EDP/__generated__/getClustersPreview";
import {
  getSpecificCluster_taskInfo_data_SpecificTaskData_result_specificCluster_Cluster,
  getSpecificCluster_taskInfo_data_SpecificTaskData_result_specificCluster_SquashedCluster
} from "../graphql/operations/queries/EDP/__generated__/getSpecificCluster";
import {
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps,
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps_FilteredARs,
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps_FilteredCFDs,
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps_FilteredFDs
} from "../graphql/operations/queries/__generated__/GetMainTaskDeps";
import {MainPrimitiveType} from "./globalTypes";

export type Cluster = getClustersPreview_taskInfo_data_SpecificTaskData_result_typoClusters;

export type ClusterInfo = {
  id?: number;
  error: boolean;
  loading: boolean;
  isSorted: boolean;
  data: { cluster: Cluster }
};

export type ClustersInfo = {
  clustersCount: number;
  typoClusters: ClusterInfo[];
};

export type SpecificCluster = getSpecificCluster_taskInfo_data_SpecificTaskData_result_specificCluster_Cluster | getSpecificCluster_taskInfo_data_SpecificTaskData_result_specificCluster_SquashedCluster;

type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type FilteredDeps = GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps;

export type UnionFilteredSpecificDeps = Omit<UnionToIntersection<Omit<
    GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps_FilteredARs, "__typename">
  | Omit<GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps_FilteredFDs, "__typename">
  | Omit<GetMainTaskDeps_taskInfo_TaskInfo_data_result_filteredDeps_FilteredCFDs, "__typename">>, "filteredDepsAmount">;

export type ImaginaryPrimitiveType = MainPrimitiveType.TypoFD;
export type RealPrimitiveType = Exclude<MainPrimitiveType, ImaginaryPrimitiveType>;
