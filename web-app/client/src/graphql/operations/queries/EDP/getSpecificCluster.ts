import { gql } from "@apollo/client";

export const GET_SPECIFIC_CLUSTER = gql`
  query getSpecificCluster($taskId: ID!, $pagination: Pagination!) {
    taskInfo(taskID: $taskId) {
      data {
        result {
          __typename
          ... on SpecificTypoClusterTaskResult {
            cluster {
              id
              items(pagination: $pagination) {
                rowIndex
                row
                isSuspicious
              }
              itemsAmount
            }
            squashedCluster {
              id
              items(pagination: $pagination) {
                rowIndex
                row
                amount
              }
              itemsAmount
            }
          }
        }
      }
    }
  }
`;
