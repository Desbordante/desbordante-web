import { gql } from '@apollo/client';
import { TASK_STATE } from '@graphql/operations/fragments';

// Spamming query.
export const GET_TASK_STATE_LITE = gql`
  ${TASK_STATE}
  query getTaskStateLite($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      state {
        ... on TaskState {
          ...TaskState
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
