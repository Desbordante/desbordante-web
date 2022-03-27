import { gql } from "@apollo/client";
import { COLUMN } from "../../fragments/fragments";

export const GET_ASSOCIATION_RULES = gql`
  ${COLUMN}

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
