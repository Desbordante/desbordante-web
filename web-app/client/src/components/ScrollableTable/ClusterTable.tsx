import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_SPECIFIC_CLUSTER } from '@graphql/operations/queries/EDP/getSpecificCluster';
import _ from 'lodash';
import {
  getSpecificCluster,
  getSpecificClusterVariables,
} from '@graphql/operations/queries/EDP/__generated__/getSpecificCluster';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './Table.module.scss';
import Table from './ScrollableTable';

type ClusterTableProps = {
  data: string[][] | undefined;
  totalCount: number;
  specificTaskID: string;
  clusterID: number;
  header?: string[];
};

const ClusterTable: FC<ClusterTableProps> = ({
  data: defaultData,
  totalCount,
  specificTaskID,
  clusterID,
  header,
}) => {
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(defaultData || []);

  const [
    getSpecificCluster,
    { data: pageResult, error, loading, startPolling, stopPolling },
  ] = useLazyQuery<getSpecificCluster, getSpecificClusterVariables>(
    GET_SPECIFIC_CLUSTER,
    {
      fetchPolicy: 'network-only',
    }
  );
  const pageCompleted =
    pageResult?.taskInfo.data &&
    'result' in pageResult?.taskInfo.data &&
    pageResult?.taskInfo.data.result?.specificCluster &&
    'items' in pageResult?.taskInfo.data.result?.specificCluster;

  const pageRows =
    pageCompleted &&
    // @ts-ignore
    pageResult?.taskInfo.data.result.specificCluster?.items.map((e) => e.row);

  useEffect(() => {
    // if (offset === 0) return;
    getSpecificCluster({
      variables: {
        taskId: specificTaskID,
        props: {
          clusterID,
          sort: true,
          squash: true,
        },
        pagination: { offset, limit: 20 },
      },
    });
  }, [offset]);

  useEffect(() => {
    if (pageCompleted) {
      // if we got the results, stop polling
      stopPolling();
    } else if (pageResult) {
      // do polling if there is a response but with no results
      startPolling(2000);
    }
  }, [pageResult]);

  const onScroll = useCallback(() => {
    if (offset + 20 < totalCount) {
      setOffset((offset) => offset + 20);
    }
  }, [totalCount, offset]);

  useEffect(() => {
    if (pageRows) {
      setData(_.uniq(data.concat(pageRows)));
    }
  }, [pageResult]);

  return (
    <Table
      {...{ data, header, onScroll }}
      className={classNames(loading && styles.disabled)}
    />
  );
};
export default ClusterTable;
