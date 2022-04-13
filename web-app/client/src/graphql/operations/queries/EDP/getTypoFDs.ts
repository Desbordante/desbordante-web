import { gql } from "@apollo/client";
import { COLUMN } from "../../fragments/fragments";

export const GET_TYPO_FDS = gql`
  ${COLUMN}

  query getTypoFDs($taskID: ID!, $pagination: Pagination!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on TypoFDTaskResult {
            TypoFDs(pagination: $pagination) {
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
