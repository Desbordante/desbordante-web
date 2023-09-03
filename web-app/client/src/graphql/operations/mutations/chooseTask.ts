import { gql } from '@apollo/client';

export const CREATE_TASK_WITH_CHOOSING_DATASET = gql`
  mutation createMainTask(
    $props: IntersectionMainTaskProps!
    $fileID: ID!
    $forceCreate: Boolean!
  ) {
    createMainTask(props: $props, fileID: $fileID, forceCreate: $forceCreate) {
      taskID
    }
  }
`;
