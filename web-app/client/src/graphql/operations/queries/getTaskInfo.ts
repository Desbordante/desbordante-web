import { gql } from "@apollo/client";

export const GET_TASK_INFO = gql`
  query getTaskInfo($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      taskID
      state {
        status
        phaseName
        currentPhase
        progress
        maxPhase
        errorMsg
        isExecuted
      }

      dataset {
        originalFileName
        snippet {
          header
          rows(pagination: { offset: 0, limit: 100 })
        }
      }

      data {
        result {
          __typename
          ... on FDTaskResult {
            FDs(pagination: { offset: 0, limit: 100 }) {
              lhs
              rhs
            }
            PKs {
              name
            }
            pieChartData {
              lhs {
                column {
                  name
                }
                value
              }
              rhs {
                column {
                  name
                }
                value
              }
            }
          }

          __typename
          ... on CFDTaskResult {
            CFDs(pagination: { offset: 0, limit: 100 }) {
              lhs
              rhs
              lhsPatterns
              rhsPattern
            }
            PKs {
              name
            }
            pieChartData {
              withPatterns {
                lhs {
                  column {
                    name
                  }
                  pattern
                  value
                }
                rhs {
                  column {
                    name
                  }
                  pattern
                  value
                }
              }
              withoutPatterns {
                lhs {
                  column {
                    name
                  }
                  value
                }
                rhs {
                  column {
                    name
                  }
                  value
                }
              }
            }
          }

          __typename
          ... on ARTaskResult {
            ARs(pagination: { offset: 0, limit: 100 }) {
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
