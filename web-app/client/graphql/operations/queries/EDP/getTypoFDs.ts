import { gql } from "@apollo/client";
import { COLUMN } from "../../fragments/fragments";

export const GET_TYPO_FDS = gql`
  ${COLUMN}

  query getTypoFDs($taskID: ID!, $filter: TypoFDsFilter!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on TypoFDTaskResult {
            TypoFDs(filter: $filter) {
              lhs {
                ...Column
              }
              rhs {
                ...Column
              }
            }
            depsAmount
          }
        }
      }
    }
  }
`;
