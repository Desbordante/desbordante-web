import { gql } from "@apollo/client";

export const CREATE_TASK_WITH_CHOOSING_DATASET = gql`
  mutation createTaskWithDatasetChoosing($props: IntersectionTaskProps!, $fileID: ID!) {
    createTaskWithDatasetChoosing(props: $props, fileID: $fileID) {
      state {
        taskID
      }
    }
  }
`;
