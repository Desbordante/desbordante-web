import { gql } from "@apollo/client";

export const GET_TASK_INFO = gql`
  query taskInfo($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      __typename
      ... on TaskInfo {
        state {
          status
          phaseName
          currentPhase
          progress
          maxPhase
          errorMsg
          isExecuted
        }
        data {
          __typename
          ... on FDTask {
            FDResult: result {
              FDs {
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
          }

          __typename
          ... on CFDTask {
            CFDResult: result {
              CFDs {
                fd {
                  lhs
                  rhs
                }
                lhsPatterns
                rhsPattern
              }
              PKs {
                name
              }
              pieChartData {
                column {
                  name
                }
                pattern
                value
              }
            }
          }
        }
        dataset {
          tableInfo {
            originalFileName
          }
          snippet(offset: 0, limit: 100) {
            header
            rows
          }
        }
      }
    }
  }
`;
