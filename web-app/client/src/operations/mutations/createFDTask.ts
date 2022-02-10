import { gql } from "@apollo/client";

export const CREATE_FD_TASK = gql`
  mutation createFDTask(
    $props: FDTaskProps!
    $datasetProps: FileProps!
    $table: Upload!
  ) {
    createFDTask(props: $props, datasetProps: $datasetProps, table: $table) {
      state {
        taskID
      }
    }
  }
`;
