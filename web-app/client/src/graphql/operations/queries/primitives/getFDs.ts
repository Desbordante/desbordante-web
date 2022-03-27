import { gql } from "@apollo/client";
import {
  COLUMN,
  PIE_CHART_DATA_WITH_PATTERNS,
  PIE_CHART_DATA_WITHOUT_PATTERNS,
} from "../../fragments/fragments";

export const GET_FUNCTIONAL_DEPENDENCIES = gql`
  ${COLUMN}
  ${PIE_CHART_DATA_WITHOUT_PATTERNS}
  ${PIE_CHART_DATA_WITH_PATTERNS}

  query getFDs($taskID: ID!, $filter: FDsFilter!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on FDTaskResult {
            FDs(filter: $filter) {
              lhs {
                ...Column
              }
              rhs {
                ...Column
              }
            }
            PKs {
              ...Column
            }
            pieChartData {
              ...PieChartDataWithoutPatterns
            }
          }
        }
      }
    }
  }
`;
