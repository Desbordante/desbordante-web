import { FC, ReactElement, useEffect, useState } from 'react';
import Image from 'next/image';

import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import { NextPageWithLayout } from 'types/pageWithLayout';
import styles from '@styles/Clusters.module.scss';
import longArrowIcon from '@assets/icons/long-arrow.svg';
import { useLazyQuery, useQuery } from '@apollo/client';
import {
  getClustersPreview,
  getClustersPreviewVariables,
} from '@graphql/operations/queries/EDP/__generated__/getClustersPreview';
import { GET_CLUSTERS_PREVIEW } from '@graphql/operations/queries/EDP/getClustersPreview';
import ClusterTable from '@components/ScrollableTable/ClusterTable';
import Pagination from '@components/Pagination/Pagination';
import Tooltip from '@components/Tooltip';

const ReportsClusters: NextPageWithLayout = () => {
  const { selectedDependency, datasetHeader, specificTaskID } =
    useTaskContext();

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [
    getClustersPreview,
    { startPolling, stopPolling, data, previousData, error },
  ] = useLazyQuery<getClustersPreview, getClustersPreviewVariables>(
    GET_CLUSTERS_PREVIEW,
    {
      // skip: true, // todo: why cannot use skip: true?
      fetchPolicy: 'network-only',
    }
  );

  const getCluster = (response?: getClustersPreview) => {
    if (
      response &&
      'result' in response?.taskInfo.data &&
      response?.taskInfo?.data?.result
    ) {
      return response?.taskInfo.data.result.typoClusters[0];
    }
    return undefined;
  };

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
  }, [page]);

  useEffect(() => {
    if (miningCompleted) {
      // if we got the results, stop polling
      stopPolling();
    } else if (data) {
      // do polling if there is a response but with no results
      startPolling(2000);
    }
  }, [data]);

  useEffect(() => {
    const taskComplete = data?.taskInfo.data && 'result' in data?.taskInfo.data;
    if (taskComplete) {
      setTotalCount(
        ('result' in data?.taskInfo.data &&
          data?.taskInfo?.data?.result &&
          data?.taskInfo?.data?.result.clustersCount) ||
          0
      );
    }
  }, [data]);

  const cluster = miningCompleted ? getCluster(data) : getCluster(previousData);
  return (
    <div className={styles.container}>
      {selectedDependency.length > 0 && !miningCompleted && !cluster && (
        <Loader
          lhs={selectedDependency.slice(0, -1).map((e) => e.column.name)}
          rhs={selectedDependency.at(-1)!.column.name}
        />
      )}{' '}
      {miningCompleted && !cluster && <h6>No clusters were found</h6>}
      {specificTaskID && cluster && (
        <>
          <h5>
            Clusters <Tooltip>Tooltip describing this section</Tooltip>
          </h5>
          <ClusterTable
            key={cluster.clusterID}
            specificTaskID={specificTaskID}
            clusterID={cluster.clusterID}
            data={cluster.items.map((e) => e.row)}
            totalCount={cluster.itemsAmount}
            header={datasetHeader}
          />{' '}
          <Pagination
            count={totalCount}
            current={page}
            onChange={(page) => setPage(page)}
          />
        </>
      )}
    </div>
  );
};

type LoaderProps = {
  rhs: string;
  lhs: string[];
};
const Loader: FC<LoaderProps> = ({ lhs, rhs }) => {
  return (
    <div className={styles.loader}>
      <video
        autoPlay
        muted
        loop
        width={70}
        height={76}
        data-testid="animated-icon"
      >
        <source src="/animated_logo.webm" type="video/webm" />
      </video>
      <div className={styles.content}>
        <h6>Discovering clusters for dependency</h6>
        <div className={styles.dependency}>
          {lhs.map((attr) => (
            <span className={styles.attr}>{attr}</span>
          ))}
          <Image src={longArrowIcon} width={66} height={15} />
          <span className={styles.attr}>{rhs}</span>
        </div>
      </div>
    </div>
  );
};

ReportsClusters.getLayout = function getLayout(page: ReactElement) {
  return (
    <TaskContextProvider>
      <ReportsLayout>{page}</ReportsLayout>
    </TaskContextProvider>
  );
};

export default ReportsClusters;
