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
        specificConfig {
          ... on FDTaskConfig {
            errorThreshold
            maxLHS
            threadsCount
          }
          ... on CFDTaskConfig {
            maxLHS
            minConfidence
            minSupportCFD
          }
          ... on ARTaskConfig {
            minConfidence
            minSupportAR
          }
          ... on TypoFDTaskConfig {
            maxLHS
            threadsCount
            errorThreshold
            approximateAlgorithm
            preciseAlgorithm
            metric
            radius
            ratio
          }
        }
      }
    }
  }
`;
