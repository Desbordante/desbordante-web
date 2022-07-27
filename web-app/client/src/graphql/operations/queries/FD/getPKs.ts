import { gql } from "@apollo/client";
import { COLUMN } from "../../fragments";

export const GET_PKS = gql`
  ${COLUMN}

  query getPKs($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        ...on TaskWithDepsData {
          result {
            __typename
            ...on ResultsWithPKs {
              PKs {
                ...Column
              }
            }
          }
        }
      }
    }
  }
`;
