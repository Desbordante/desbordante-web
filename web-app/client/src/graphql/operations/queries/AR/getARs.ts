import { gql } from "@apollo/client";

export const GET_ARS = gql`
  query getARs($taskID: ID!, $filter: Pagination!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on ARTaskResult {
            ARs(pagination: $filter) {
              lhs
              rhs
              support
            }
          }
        }
      }
    }
  }
`;
