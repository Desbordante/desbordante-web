import { gql } from '@apollo/client';

export const BASE_CONFIG = gql`
  fragment BaseConfig on BaseTaskConfig {
    algorithmName
    type
  }
`;

export const TASK_STATE = gql`
  fragment TaskState on TaskState {
    isPrivate
    attemptNumber
    processStatus
    phaseName
    currentPhase
    progress
    maxPhase
    isExecuted
    elapsedTime
  }
`;

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

export const AR = gql`
  fragment AR on AR {
    __typename
    confidence
    lhs
    rhs
  }
`;

export const FD = gql`
  fragment FD on FD {
    __typename
    lhs {
      __typename
      ...Column
    }
    rhs {
      __typename
      ...Column
    }
  }
`;

export const CFD = gql`
  fragment CFD on CFD {
    __typename
    lhs {
      __typename
      ...Item
    }
    rhs {
      __typename
      ...Item
    }
  }
`;

export const Item = gql`
  fragment Item on Item {
    __typename
    column {
      ...Column
    }
    pattern
  }
`;
