import { gql } from '@apollo/client';

export const DOWNLOAD_RESULTS = gql`
  mutation downloadResults(
    $taskID: ID!
    $filter: IntersectionFilter!
    $props: DownloadingTaskProps!
  ) {
    downloadResults(taskID: $taskID, filter: $filter, props: $props) {
      url
    }
  }
`;
