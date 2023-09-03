import { gql } from '@apollo/client';
import { PIE_CHART_DATA_WITHOUT_PATTERNS } from '../fragments';

export const GET_PIE_CHART_DATA = gql`
  ${PIE_CHART_DATA_WITHOUT_PATTERNS}
  query getPieChartData($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        ... on TaskWithDepsData {
          __typename
          pieChartData: result {
            ... on FDTaskResult {
              FD: pieChartData {
                withoutPatterns {
                  ...PieChartDataWithoutPatterns
                }
              }
            }
            ... on CFDTaskResult {
              CFD: pieChartData {
                withoutPatterns {
                  ...PieChartDataWithoutPatterns
                }
              }
            }
          }
        }
      }
    }
  }
`;
