import { gql } from "@apollo/client";

export const GET_TASK_INFO = gql`
  query getTaskInfo($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      state {
        ... on TaskState {
          isPrivate
          attemptNumber
          processStatus
          phaseName
          currentPhase
          progress
          maxPhase
          isExecuted
          elapsedTime
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
      data {
        baseConfig {
          algorithmName
          type
        }
      }
    }
  }
`;
