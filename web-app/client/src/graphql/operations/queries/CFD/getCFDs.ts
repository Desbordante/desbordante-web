import { gql } from "@apollo/client";

export const GET_CFDS = gql`
  fragment Item on Item {
    column {
      name
      index
    }
    pattern
  }

  query getCFDs($taskID: ID!, $filter: CFDsFilter!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on CFDTaskResult {
            CFDs(filter: $filter) {
              lhs {
                ...Item
              }
              rhs {
                ...Item
              }
              confidence
              support
            }
            depsAmount
          }
        }
      }
    }
  }
`;
