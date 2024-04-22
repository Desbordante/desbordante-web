import { ApolloError, useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  getClustersPreview,
  getClustersPreviewVariables,
} from '@graphql/operations/queries/EDP/__generated__/getClustersPreview';
import { GET_CLUSTERS_PREVIEW } from '@graphql/operations/queries/EDP/getClustersPreview';
import { useErrorContext } from './useErrorContext';

type ClustersResult = {
  miningCompleted: boolean;
  data?: getClustersPreview;
  previousData?: getClustersPreview;
  loading: boolean;
  error?: ApolloError;
  totalCount?: number;
};

const useClustersPreview: (
  specificTaskID: string | undefined,
  page: number,
) => ClustersResult = (specificTaskID, page) => {
  const [
    getClustersPreview,
    { startPolling, stopPolling, data, loading, previousData, error },
  ] = useLazyQuery<getClustersPreview, getClustersPreviewVariables>(
    GET_CLUSTERS_PREVIEW,
    {
      fetchPolicy: 'network-only',
    },
  );
  const { showError } = useErrorContext();
  const [totalCount, setTotalCount] = useState<number | undefined>();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, specificTaskID]);

  useEffect(() => {
    if (miningCompleted || error) {
      // if we got the results or errors, stop polling
      stopPolling();
    } else if (data) {
      // do polling if there is a response but with no results
      startPolling(2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error]);

  useEffect(() => {
    if (error) {
      showError({
        message: 'Error occurred while loading clusters',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    const taskComplete = data?.taskInfo.data && 'result' in data?.taskInfo.data;
    if (taskComplete) {
      setTotalCount(
        ('result' in data?.taskInfo.data &&
          data?.taskInfo?.data?.result &&
          data?.taskInfo?.data?.result.clustersCount) ||
          0,
      );
    }
  }, [data]);

  return {
    miningCompleted: !!miningCompleted,
    error,
    loading,
    data,
    previousData,
    totalCount,
  };
};

export default useClustersPreview;
