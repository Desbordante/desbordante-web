import { gql } from "@apollo/client";

export const UPLOAD_DATASET = gql`
  mutation uploadDataset(
    $datasetProps: FileProps!
    $table: Upload!
  ) {
    uploadDataset(datasetProps: $datasetProps, table: $table) {
          fileID
          fileName
          hasHeader
          delimiter
          supportedPrimitives
          rowsCount
          countOfColumns
          isBuiltIn
      }
  }
`;
