import { gql } from '@apollo/client';

export const GET_TASK_STATE = gql`
  query getTaskState($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      state {
        ... on TaskState {
          isExecuted
        }
        ... on BaseTaskError {
          errorStatus
          ... on ResourceLimitTaskError {
            resourceLimitError
          }
          ... on InternalServerTaskError {
            internalError
          }
        }
      }
    }
  }
`;
