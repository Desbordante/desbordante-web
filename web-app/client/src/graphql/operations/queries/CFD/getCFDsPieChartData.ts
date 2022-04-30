import { gql } from "@apollo/client";
import {
  PIE_CHART_DATA_WITHOUT_PATTERNS,
} from "../../fragments/fragments";

export const GET_CFDS_PIE_CHART_DATA = gql`
  ${PIE_CHART_DATA_WITHOUT_PATTERNS}

  query getCFDsPieChartData($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on CFDTaskResult {
            pieChartData {
              withoutPatterns {
                ...PieChartDataWithoutPatterns
              }
            }
          }
        }
      }
    }
  }
`;
