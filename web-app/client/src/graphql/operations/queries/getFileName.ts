import { gql } from '@apollo/client';

export const GET_FILE_NAME = gql`
  query getFileName($fileID: ID!) {
    datasetInfo(fileID: $fileID) {
      fileName
    }
  }
`;
