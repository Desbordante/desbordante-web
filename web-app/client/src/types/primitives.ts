import {ARsFilter, FDsFilter, Pagination} from "./globalTypes";
import {
  getClustersPreview_taskInfo_data_result_TypoClusterTaskResult,
  getClustersPreview_taskInfo_data_result_TypoClusterTaskResult_TypoClusters
} from "../graphql/operations/queries/EDP/__generated__/getClustersPreview";

export type PrimitiveFilter = {
  FD: FDsFilter;
  CFD: Pagination;
  AR: ARsFilter;
  TypoFD: Pagination;
};

export type Cluster = getClustersPreview_taskInfo_data_result_TypoClusterTaskResult_TypoClusters;
export type ClustersInfo = getClustersPreview_taskInfo_data_result_TypoClusterTaskResult;