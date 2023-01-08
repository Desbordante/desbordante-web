import { gql } from '@apollo/client';
import { BASE_CONFIG } from '@graphql/operations/fragments';

export const GET_MFD_TASK_DATA = gql`
  query GetMFDTaskData(
    $taskID: ID!
    $clusterIndex: Int!
    $offset: Int!
    $limit: Int!
    $sortBy: MFDSortBy!
  ) {
    taskInfo(taskID: $taskID) {
      __typename
      ... on SpecificTaskInfo {
        data {
          __typename
          ... on SpecificTaskData {
            result {
              __typename
              ... on MFDTaskResult {
                result
                clustersTotalCount
                cluster(
                  clusterIndex: $clusterIndex
                  pagination: { offset: $offset, limit: $limit }
                  sortBy: $sortBy
                ) {
                  value
                  highlightsTotalCount
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
  }
`;
