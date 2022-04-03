import { gql } from "@apollo/client";
import { PIE_CHART_DATA_WITHOUT_PATTERNS } from "../../fragments/fragments";

export const GET_FDS_PIE_CHART_DATA = gql`
  ${PIE_CHART_DATA_WITHOUT_PATTERNS}

  query getFDsPieChartData($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on FDTaskResult {
            pieChartData {
              ...PieChartDataWithoutPatterns
            }
          }
        }
      }
    }
  }
`;
