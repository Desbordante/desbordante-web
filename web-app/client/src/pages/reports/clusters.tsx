import { FC, ReactElement, useContext, useEffect, useState } from 'react';
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
  getClustersPreview_taskInfo_data_SpecificTaskData_result,
  getClustersPreview_taskInfo_data_SpecificTaskData_result_typoClusters,
} from '@graphql/operations/queries/EDP/__generated__/getClustersPreview';
import { GET_CLUSTERS_PREVIEW } from '@graphql/operations/queries/EDP/getClustersPreview';
import ScrollableTable from '@components/ScrollableTable';
import Pagination from '@components/Pagination/Pagination';

const ReportsClusters: NextPageWithLayout = () => {
  const { selectedDependency, specificTaskID } = useTaskContext();

  const [page, setPage] = useState(1);

  const { refetch, startPolling, stopPolling, data, error } = useQuery<
    getClustersPreview,
    getClustersPreviewVariables
  >(GET_CLUSTERS_PREVIEW, {
    // skip: false,
    fetchPolicy: 'network-only',
    pollInterval: 2000,
  });

  useEffect(() => {
    if (data) {
      stopPolling();
    }
  }, [data]);

  useEffect(() => {
    stopPolling();
    if (specificTaskID) {
      refetch({
        taskId: specificTaskID,
        clustersPagination: { offset: 0 /*page - 1*/, limit: 100 /*1*/ },
        itemsLimit: 20,
      });
      startPolling(2000);
    }
  }, [page]);

  const [totalCount, cluster] = (data?.taskInfo.data &&
    'result' in data?.taskInfo.data &&
    data?.taskInfo.data.result && [
      data.taskInfo.data.result.clustersCount,
      data?.taskInfo.data.result.typoClusters[page - 1],
    ]) || [0, undefined];

  return (
    <div className={styles.container}>
      <h5>Clusters</h5>
      {selectedDependency.length > 0 && !cluster && (
        <Loader
          lhs={selectedDependency.slice(0, -1).map((e) => e.column.name)}
          rhs={selectedDependency.at(-1)!.column.name}
        />
      )}{' '}
      {specificTaskID && cluster && (
        <>
          <ScrollableTable
            key={cluster.clusterID}
            specificTaskID={specificTaskID}
            clusterID={cluster.clusterID}
            data={cluster.items.map((e) => e.row)}
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
