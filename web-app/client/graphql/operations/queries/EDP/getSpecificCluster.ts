import { gql } from "@apollo/client";

export const GET_SPECIFIC_CLUSTER = gql`
  query getSpecificCluster($taskId: ID!, $pagination: Pagination!, $sort: Boolean!) {
    taskInfo(taskID: $taskId) {
      data {
        result {
          __typename
          ... on SpecificTypoClusterTaskResult {
            cluster(sort: $sort) {
              id
              items(pagination: $pagination) {
                rowIndex
                row
                isSuspicious
              }
              itemsAmount
            }
            squashedCluster(sort: $sort) {
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
