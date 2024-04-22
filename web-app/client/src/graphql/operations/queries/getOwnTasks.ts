import { gql } from '@apollo/client';

export const GET_OWN_TASKS = gql`
  query getOwnTasks($props: TasksQueryProps!) {
    user {
      tasks(props: $props) {
        total
        data {
          taskID
          state {
            ... on TaskState {
              user {
                fullName
              }
              processStatus
              phaseName
              currentPhase
              progress
              maxPhase
              isExecuted
              elapsedTime
              createdAt
            }
          }

          data {
            baseConfig {
              algorithmName
              type
            }
          }

          dataset {
            originalFileName
          }
        }
      }
    }
  }
`;
