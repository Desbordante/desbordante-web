import { gql } from "@apollo/client";

export const GET_CLUSTERS_PREVIEW = gql`
  query getClustersPreview($taskId: ID!, $pagination: Pagination!) {
    taskInfo(taskID: $taskId) {
      data {
        result {
          __typename
          ... on TypoClusterTaskResult {
            TypoClusters(pagination: $pagination) {
              id
              items(pagination: { limit: 10, offset: 0 }) {
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
`;
