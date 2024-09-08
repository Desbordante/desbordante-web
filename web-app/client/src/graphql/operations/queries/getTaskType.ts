import { gql } from '@apollo/client';
import { BASE_CONFIG } from '@graphql/operations/fragments';

export const GET_TASK_TYPE = gql`
  ${BASE_CONFIG}
  query getTaskType($taskID: ID!) {
    taskInfo(taskID: $taskID) {
      data {
        baseConfig {
          ...BaseConfig
        }
      }
    }
  }
`;
