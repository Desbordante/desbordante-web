import { gql } from "@apollo/client";

export const GET_CFDS_KEYS = gql`
  query getCFDsKeys($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on CFDTaskResult {
            PKs {
              name
            }
          }
        }
      }
    }
  }
`;
