import { gql } from "@apollo/client";

export const CHOOSE_FD_TASK = gql`
  mutation chooseFDTask($props: FDTaskProps!, $fileID: ID!) {
    chooseFDTask(props: $props, fileID: $fileID) {
      state {
        taskID
      }
    }
  }
`;
