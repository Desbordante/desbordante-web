import { gql } from '@apollo/client';
import { AR, CFD, COLUMN, FD, Item } from '../fragments';

// currently it supports only FD
export const GET_MAIN_TASK_DEPS = gql`
  ${FD}
  ${AR}
  ${CFD}
  ${Item}
  ${COLUMN}
  query GetMainTaskDeps($taskID: ID!, $filter: IntersectionFilter!) {
    taskInfo(taskID: $taskID) {
      ... on SpecificTaskInfo {
        data {
          ... on SpecificTaskData {
            result {
              taskID
            }
          }
        }
      }
      taskID
      ... on TaskInfo {
        data {
          result {
            taskID
            __typename
            ... on FDTaskResult {
              __typename
              depsAmount
              filteredDeps(filter: $filter) {
                __typename
                filteredDepsAmount
                ... on FilteredDepsBase {
                  __typename
                  filteredDepsAmount
                }

                ... on FilteredFDs {
                  FDs: deps {
                    ...FD
                  }
                }
              }
            }

            ... on TypoFDTaskResult {
              __typename
              depsAmount
              filteredDeps(filter: $filter) {
                __typename
                filteredDepsAmount
                ... on FilteredDepsBase {
                  __typename
                  filteredDepsAmount
                }

                ... on FilteredFDs {
                  FDs: deps {
                    ...FD
                  }
                }
              }
            }

            ... on CFDTaskResult {
              __typename
              depsAmount
              filteredDeps(filter: $filter) {
                __typename
                filteredDepsAmount
                ... on FilteredDepsBase {
                  __typename
                  filteredDepsAmount
                }

                ... on FilteredCFDs {
                  CFDs: deps {
                    ...CFD
                  }
                }
              }
            }

            ... on ARTaskResult {
              __typename
              depsAmount
              filteredDeps(filter: $filter) {
                __typename
                filteredDepsAmount
                ... on FilteredDepsBase {
                  __typename
                  filteredDepsAmount
                }

                ... on FilteredARs {
                  ARs: deps {
                    ...AR
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
