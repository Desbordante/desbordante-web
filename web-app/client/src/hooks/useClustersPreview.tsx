import { ApolloError, useLazyQuery } from '@apollo/client';
import { GET_CLUSTERS_PREVIEW } from '@graphql/operations/queries/EDP/getClustersPreview';
import {
  getClustersPreview,
  getClustersPreviewVariables,
} from '@graphql/operations/queries/EDP/__generated__/getClustersPreview';
import { useEffect } from 'react';
import { useErrorContext } from './useErrorContext';

type ClustersResult = {
  miningCompleted: boolean;
  data?: getClustersPreview;
  previousData?: getClustersPreview;
  loading: boolean;
  error?: ApolloError;
};

const useClustersPreview: (
  specificTaskID: string | undefined,
  page: number
) => ClustersResult = (specificTaskID, page) => {
  const [
    getClustersPreview,
    { startPolling, stopPolling, data, loading, previousData, error },
  ] = useLazyQuery<getClustersPreview, getClustersPreviewVariables>(
    GET_CLUSTERS_PREVIEW,
    {
      fetchPolicy: 'network-only',
    }
  );

  const { showError } = useErrorContext();

  const miningCompleted =
    data?.taskInfo.data &&
    'result' in data?.taskInfo.data &&
    data?.taskInfo.data.result;

  useEffect(() => {
    if (specificTaskID) {
      getClustersPreview({
        variables: {
          taskId: specificTaskID,
          clustersPagination: { offset: page - 1, limit: 1 },
          itemsLimit: 20,
        },
      });
    }
  }, [page, specificTaskID]);

  useEffect(() => {
    if (miningCompleted || error) {
      // if we got the results or errors, stop polling
      stopPolling();
    } else if (data) {
      // do polling if there is a response but with no results
      startPolling(2000);
    }
  }, [data, error]);

  useEffect(() => {
    if (error) {
      showError({
        message: 'Error occurred while loading clusters',
      });
    }
  }, [error]);

  return {
    miningCompleted: !!miningCompleted,
    error,
    loading,
    data,
    previousData,
  };
};

export default useClustersPreview;
