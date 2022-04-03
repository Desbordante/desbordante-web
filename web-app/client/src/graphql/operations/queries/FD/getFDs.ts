import { gql } from "@apollo/client";
import { COLUMN } from "../../fragments/fragments";

export const GET_FDS = gql`
  ${COLUMN}

  query getFDs($taskID: ID!, $filter: FDsFilter!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on FDTaskResult {
            FDs(filter: $filter) {
              lhs {
                ...Column
              }
              rhs {
                ...Column
              }
            }
          }
        }
      }
    }
  }
`;
