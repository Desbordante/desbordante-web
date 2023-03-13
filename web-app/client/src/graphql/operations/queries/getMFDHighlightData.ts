import { gql } from '@apollo/client';

export const GET_MFD_HIGHLIGHT_DATA = gql`
  query GetMFDHighlightData(
    $taskID: ID!
    $clusterIndex: Int!
    $rowIndex: Int!
  ) {
    taskInfo(taskID: $taskID) {
      data {
        ... on SpecificTaskData {
          result {
            ... on MFDTaskResult {
              clusterRow(clusterIndex: $clusterIndex, rowIndex: $rowIndex) {
                index
                withinLimit
                maximumDistance
                furthestPointIndex
                value
              }
            }
          }
        }
      }
    }
  }
`;
