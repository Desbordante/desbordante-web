import { gql } from "@apollo/client";

export const CREATE_TASK_WITH_CHOOSING_DATASET = gql`
  mutation createTaskWithDatasetChoosing($props: IntersectionMainTaskProps! $fileID: ID! $forceCreate: Boolean!) {
    createMainTaskWithDatasetChoosing(props: $props, fileID: $fileID, forceCreate: $forceCreate) {
      taskID
    }
  }
`;
