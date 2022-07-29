import { gql } from "@apollo/client";

export const GET_ARS = gql`
  query getARs($taskID: ID!, $filter: ARsFilter!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on ARTaskResult {
            ARs(filter: $filter) {
              lhs
              rhs
              confidence
            }
            depsAmount
          }
        }
      }
    }
  }
`;
