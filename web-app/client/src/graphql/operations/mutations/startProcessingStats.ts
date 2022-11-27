import { gql } from '@apollo/client';

export const START_PROCESSING_STATS = gql`
  mutation startProcessingStats($fileID: ID!, $threadsCount: Int!) {
    createMainTaskWithDatasetChoosing(
      fileID: $fileID
      props: {
        threadsCount: $threadsCount
        type: Stats
        algorithmName: "Stats"
      }
    ) {
      taskID
    }
  }
`;
