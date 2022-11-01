import { gql } from "@apollo/client";

export const GET_CLUSTERS_PREVIEW = gql`
  query getClustersPreview($taskId: ID! $clustersPagination: Pagination! $itemsLimit: Int!) {
    taskInfo(taskID: $taskId) {
      data {
        ...on SpecificTaskData {
          result {
            ...on TypoClusterTaskResult {
              __typename
              typoClusters(pagination: $clustersPagination) {
                  clusterID
                  items(pagination: { limit: $itemsLimit, offset: 0 }) {
                    rowIndex
                    row
                    isSuspicious
                  }
                  itemsAmount
                }
                clustersCount
              }
          }
        }
      }
    }
  }
`;
