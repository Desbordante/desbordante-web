import { FC, ReactElement, useEffect, useState } from 'react';
import Image from 'next/image';
import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import { NextPageWithLayout } from 'types/pageWithLayout';
import styles from '@styles/Clusters.module.scss';
import longArrowIcon from '@assets/icons/long-arrow.svg';
import { getClustersPreview } from '@graphql/operations/queries/EDP/__generated__/getClustersPreview';
import ClusterTable from '@components/ScrollableTable/ClusterTable';
import Pagination from '@components/Pagination/Pagination';
import Tooltip from '@components/Tooltip';
import useClustersPreview from '@hooks/useClustersPreview';

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

const ReportsClusters: NextPageWithLayout = () => {
  const { selectedDependency, datasetHeader, specificTaskID } =
    useTaskContext();
  const [page, setPage] = useState(1);

  const { data, totalCount, previousData, miningCompleted } =
    useClustersPreview(specificTaskID, page);

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
          {totalCount && (
            <Pagination
              count={totalCount}
              current={page}
              onChange={(page) => setPage(page)}
            />
          )}
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
