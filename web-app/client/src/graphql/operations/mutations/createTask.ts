import { gql } from "@apollo/client";

export const CREATE_TASK_WITH_UPLOADING_DATASET = gql`
  mutation createTaskWithDatasetUploading(
    $props: IntersectionTaskProps!
    $datasetProps: FileProps!
    $table: Upload!
  ) {
      createTaskWithDatasetUploading(props: $props, datasetProps: $datasetProps, table: $table) {
      state {
        taskID
      }
    }
  }
`;
