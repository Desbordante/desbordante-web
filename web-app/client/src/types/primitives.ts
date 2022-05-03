import {ARsFilter, CFDsFilter, FDsFilter, TypoFDsFilter} from "./globalTypes";
import { getClustersPreview_taskInfo_data_result_TypoClusterTaskResult_TypoClusters } from "../graphql/operations/queries/EDP/__generated__/getClustersPreview";
import { getSpecificCluster_taskInfo_data_result_SpecificTypoClusterTaskResult_squashedCluster } from "../graphql/operations/queries/EDP/__generated__/getSpecificCluster";

export type PrimitiveFilter = {
  FD: FDsFilter;
  CFD: CFDsFilter;
  AR: ARsFilter;
  TypoFD: TypoFDsFilter;
};

export type Cluster =
  getClustersPreview_taskInfo_data_result_TypoClusterTaskResult_TypoClusters;

export type SquashedCluster =
  getSpecificCluster_taskInfo_data_result_SpecificTypoClusterTaskResult_squashedCluster;

export type ClusterTask = {
  id?: number;
  error: boolean;
  loading: boolean;
  data: { cluster?: Cluster; squashedCluster?: SquashedCluster };
};

export type ClustersInfo = {
  clustersCount: number;
  TypoClusters: ClusterTask[];
};
