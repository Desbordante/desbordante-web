import { gql } from "@apollo/client";

export const COLUMN = gql`
  fragment Column on Column {
    name
    index
  }
`;

export const PIE_CHART_DATA_WITHOUT_PATTERNS = gql`
  ${COLUMN}
  fragment PieChartDataWithoutPatterns on PieChartWithoutPatterns {
    lhs {
      column {
        ...Column
      }
      value
    }
    rhs {
      column {
        ...Column
      }
      value
    }
  }
`;

export const PIE_CHART_DATA_WITH_PATTERNS = gql`
  ${COLUMN}
  fragment PieChartDataWithPatterns on PieChartWithPatterns {
    lhs {
      column {
        ...Column
      }
      pattern
      value
    }
    rhs {
      column {
        ...Column
      }
      pattern
      value
    }
  }
`;