import { gql } from '@apollo/client';

export const GET_FILE_STATS = gql`
  query getFileStats($fileID: ID!) {
    datasetInfo(fileID: $fileID) {
      fileID
      fileName
      hasStats
      countOfColumns
      overview {
        categoricals
        integers
        floats
        strings
      }
      stats {
        columnIndex
        columnName
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
        type
      }
    }
  }
`;
