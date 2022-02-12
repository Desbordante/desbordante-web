import { gql } from "@apollo/client";

export const GET_TASK_INFO = gql`
  query taskInfo($id: ID!) {
    taskInfo(id: $id) {
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
            result {
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
