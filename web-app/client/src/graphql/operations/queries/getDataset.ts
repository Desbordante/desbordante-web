import { gql } from "@apollo/client";

export const GET_DATASET = gql`
  query getDataset($taskID: ID!, $pagination: Pagination!) {
    taskInfo(taskID: $taskID) {
      dataset {
        originalFileName
        snippet {
          header
          rows(pagination: $pagination)
        }
      }
    }
  }
`;
