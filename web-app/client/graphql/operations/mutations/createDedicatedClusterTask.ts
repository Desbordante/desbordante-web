import { gql } from "@apollo/client";

export const CREATE_DEDICATED_CLUSTER_TASK = gql`
  mutation createDedicatedClusterTask($taskId: String!, $clusterId: Int!) {
    createTypoMinerTask(
      props: { type: SpecificTypoCluster, typoClusterTaskID: $taskId, clusterID: $clusterId }
    ) {
      taskID
    }
  }
`;
