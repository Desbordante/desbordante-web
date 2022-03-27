import { gql } from "@apollo/client";
import {
  COLUMN,
  PIE_CHART_DATA_WITH_PATTERNS,
  PIE_CHART_DATA_WITHOUT_PATTERNS,
} from "../../fragments/fragments";

export const GET_CONDITIONAL_DEPENDENCIES = gql`
  ${COLUMN}
  ${PIE_CHART_DATA_WITHOUT_PATTERNS}
  ${PIE_CHART_DATA_WITH_PATTERNS}

  query getCFDs($taskID: ID!, $filter: Pagination!) {
    taskInfo(taskID: $taskID) {
      data {
        result {
          __typename
          ... on CFDTaskResult {
            CFDs(pagination: $filter) {
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
                ...PieChartDataWithPatterns
              }
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
