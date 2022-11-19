import { FC, ReactElement, useContext, useEffect, useState } from 'react';
import Image from 'next/image';

import { ReportsLayout } from '@components/ReportsLayout/ReportsLayout';
import { TaskContextProvider, useTaskContext } from '@components/TaskContext';
import { NextPageWithLayout } from 'types/pageWithLayout';
import styles from '@styles/Clusters.module.scss';
import longArrowIcon from '@assets/icons/long-arrow.svg';
import { useLazyQuery } from '@apollo/client';
import {
  getClustersPreview,
  getClustersPreviewVariables,
  getClustersPreview_taskInfo_data_SpecificTaskData_result,
} from '@graphql/operations/queries/EDP/__generated__/getClustersPreview';
import { GET_CLUSTERS_PREVIEW } from '@graphql/operations/queries/EDP/getClustersPreview';
import Table from '@components/Table';

const ReportsClusters: NextPageWithLayout = () => {
  const { selectedDependency, specificTaskID } = useTaskContext();

  const [clusters, setClusters] =
    useState<getClustersPreview_taskInfo_data_SpecificTaskData_result>();
  const [getClustersPreview] = useLazyQuery<
    getClustersPreview,
    getClustersPreviewVariables
  >(GET_CLUSTERS_PREVIEW, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (!specificTaskID) return;
    getClustersPreview({
      variables: {
        taskId: specificTaskID,
        clustersPagination: { offset: 0, limit: 500 },
        itemsLimit: 10,
      },
    }).then((res) => {
      if (
        res.data?.taskInfo.data &&
        'result' in res.data?.taskInfo.data &&
        res.data?.taskInfo.data.result
      ) {
        setClusters(res.data?.taskInfo.data.result);
      }
    });
  }, []);
  return (
    <div className={styles.container}>
      <h5>Clusters</h5>
      {selectedDependency.length > 0 && !clusters && (
        <Loader
          lhs={selectedDependency.slice(0, -1).map((e) => e.column.name)}
          rhs={selectedDependency.at(-1)!.column.name}
        />
      )}{' '}
      {clusters && (
        <Table data={clusters?.typoClusters[0]!.items.map((e) => e.row)} />
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
          <Image src={longArrowIcon} />
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
