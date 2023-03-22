import { gql } from '@apollo/client';

export const GET_MFD_TASK_INFO = gql`
  query GetMFDTaskInfo(
    $taskID: ID!
    $clusterIndex: Int!
    $offset: Int!
    $limit: Int!
    $sortBy: MFDSortBy!
    $orderBy: OrderBy!
  ) {
    taskInfo(taskID: $taskID) {
      __typename

      data {
        ... on TaskWithDepsData {
          result {
            ... on MFDTaskResult {
              depsAmount
              result
              filteredDeps(
                filter: {
                  MFDSortBy: $sortBy
                  orderBy: $orderBy
                  filterString: ""
                  pagination: { offset: $offset, limit: $limit }
                  MFDClusterIndex: $clusterIndex
                }
              ) {
                filteredDepsAmount
                ... on FilteredMFDs {
                  deps {
                    index
                    withinLimit
                    maximumDistance
                    furthestPointIndex
                    furthestPointValue
                    clusterValue
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
