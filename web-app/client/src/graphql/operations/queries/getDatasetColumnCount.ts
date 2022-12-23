import { gql } from '@apollo/client';
import { COLUMN } from '../fragments';

export const GET_COUNT_OF_COLUMNS = gql`
  ${COLUMN}
  query getCountOfColumns($fileID: ID!) {
    datasetInfo(fileID: $fileID) {
      countOfColumns
      hasHeader
      header
      statsInfo {
        stats {
          column {
            ...COLUMN
          }
          type
        }
      }
    }
  }
`;
