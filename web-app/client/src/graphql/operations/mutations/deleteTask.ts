import { gql } from "@apollo/client";

export const DELETE_TASK = gql`
  mutation deleteTask($taskID: ID!) {
    deleteTask(taskID: $taskID) {
      message
    }
  }
`;
