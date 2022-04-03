import { gql } from "@apollo/client";

export const GET_CFDS = gql`
  query getCFDs($taskID: ID!, $filter: Pagination!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on CFDTaskResult {
            CFDs(pagination: $filter) {
              lhs
              rhs
              lhsPatterns
              rhsPattern
            }
          }
        }
      }
    }
  }
`;
