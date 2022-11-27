import { gql } from '@apollo/client';

export const GET_FILE_STATS = gql`
  query getFileStats($fileID: ID!) {
    datasetInfo(fileID: $fileID) {
      fileID
      fileName
      countOfColumns
      statsInfo {
        state {
          ... on TaskState {
            progress
          }
          ... on InternalServerTaskError {
            errorStatus
          }
          ... on ResourceLimitTaskError {
            errorStatus
          }
        }
        stats(pagination: { offset: 0, limit: 100 }) {
          column {
            name
            index
          }
          type
          distinct
          isCategorical
          count
          avg
          STD
          skewness
          kurtosis
          min
          max
          sum
          quantile25
          quantile50
          quantile75
        }
      }
    }
  }
`;
