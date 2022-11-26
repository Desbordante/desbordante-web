import { gql } from '@apollo/client';

export const GET_COUNT_OF_COLUMNS = gql`
  query getCountOfColumns($fileID: ID!) {
    datasetInfo(fileID: $fileID) {
      countOfColumns
    }
  }
`;
