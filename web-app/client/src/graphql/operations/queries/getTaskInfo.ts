import { gql } from "@apollo/client";

export const GET_TASK_INFO = gql`
  query getTaskInfo($taskID: ID!) {
      taskInfo(taskID: $taskID) {
          taskID
          state {
              ... on TaskState {
                  processStatus
                  phaseName
                  currentPhase
                  progress
                  maxPhase
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
                      FDs(filter: { 
                          pagination: { offset: 0, limit: 100 }
                          sortBy: COL_ID
                          sortSide: LHS
                          withoutKeys: false
                          orderBy: ASC
                      }) {
                          lhs
                          rhs
                      }
                      PKs {
                          name
                      }
                      pieChartData {
                          ... PieChartDataWithoutPatterns
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
                              ... PieChartDataWithPatterns
                          }
                          withoutPatterns {
                              ... PieChartDataWithoutPatterns
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
  fragment PieChartDataWithoutPatterns on PieChartWithoutPatterns {
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
  
  fragment PieChartDataWithPatterns on PieChartWithPatterns {
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
`;
