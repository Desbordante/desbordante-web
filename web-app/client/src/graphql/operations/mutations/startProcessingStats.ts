import { gql } from '@apollo/client';

export const START_PROCESSING_STATS = gql`
  mutation startProcessingStats($fileID: ID!, $threadsCount: Int!) {
    startProcessingStats(fileID: $fileID, threadsCount: $threadsCount) {
      fileID
    }
  }
`;
