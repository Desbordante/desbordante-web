import { gql } from '@apollo/client';

export const GET_MFD_HIGHLIGHT_DATA = gql`
  query GetMFDHighlightData(
    $taskID: ID!
    $clusterIndex: Int!
    $pointIndex: Int!
  ) {
    taskInfo(taskID: $taskID) {
      data {
        ... on SpecificTaskData {
          result {
            ... on MFDTaskResult {
              cluster(
                clusterIndex: $clusterIndex
                pagination: { offset: $pointIndex, limit: 1 }
                sortBy: POINT_INDEX
              ) {
                highlights {
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
  }
`;
