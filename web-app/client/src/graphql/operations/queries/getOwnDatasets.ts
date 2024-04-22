import { gql } from '@apollo/client';

export const GET_OWN_DATASETS = gql`
  query getOwnDatasets($props: DatasetsQueryProps!) {
    user {
      datasets(props: $props) {
        total
        data {
          fileID
          fileName
          hasHeader
          delimiter
          supportedPrimitives
          rowsCount
          fileSize
          fileFormat {
            inputFormat
            tidColumnIndex
            itemColumnIndex
            hasTid
          }
          user {
            fullName
          }
          countOfColumns
          isBuiltIn
          createdAt
          originalFileName
          numberOfUses
        }
      }
    }
  }
`;
