import { gql } from "@apollo/client";

export const GET_SPECIFIC_CLUSTER = gql`
  query getSpecificCluster($taskId: ID! $props: SpecificClusterTaskProps! $pagination: Pagination!) {
    taskInfo(taskID: $taskId) {
      data {
        ...on SpecificTaskData {
          result {
            __typename
            ...on TypoClusterTaskResult {
              specificCluster(props: $props) {
                __typename
                ...on ClusterBase {
                  clusterID
                  itemsAmount
                }
                ...on Cluster {
                    items(pagination: $pagination) {
                      rowIndex
                      row
                      isSuspicious
                    }
                }
                ...on SquashedCluster {
                  items(pagination: $pagination) {
                    rowIndex
                    row
                    amount
                  }
                }
                ...on TaskState {
                  progress
                  isExecuted
                }
                ...on BaseTaskError {
                  errorStatus
                }
                ...on InternalServerTaskError {
                  internalError
                }
              }
            }
          }
        }
      }
    }
  }
`;
