import { gql } from "@apollo/client";
import { COLUMN } from "../../fragments/fragments";

export const GET_FDS_KEYS = gql`
  ${COLUMN}

  query getFDsKeys($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on FDTaskResult {
            PKs {
              ...Column
            }
          }
        }
      }
    }
  }
`;
