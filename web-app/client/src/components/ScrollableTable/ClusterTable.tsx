import { useLazyQuery } from '@apollo/client';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import ClusterOptions from '@components/ClusterOptions';
import { useTaskContext } from '@components/TaskContext';
import {
  getSpecificCluster,
  getSpecificClusterVariables,
} from '@graphql/operations/queries/EDP/__generated__/getSpecificCluster';
import { GET_SPECIFIC_CLUSTER } from '@graphql/operations/queries/EDP/getSpecificCluster';
import { useErrorContext } from '@hooks/useErrorContext';
import Table from './ScrollableTable';
import styles from './Table.module.scss';

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
  const [squash, setSquash] = useState(false);
  const [sort, setSort] = useState(false);
  const { showError } = useErrorContext();
  const { selectedDependency } = useTaskContext();
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

  const parseItem = (e: any) => e.row;
  const parseSquashItem = (e: any) =>
    ['x' + e.amount].concat(
      selectedDependency.map((column) => e.row[column.column.index])
    );
  const pageRows =
    pageCompleted &&
    // @ts-ignore
    pageResult?.taskInfo.data.result.specificCluster?.items.map(
      squash ? parseSquashItem : parseItem
    );

  useEffect(() => {
    setData((!squash && !sort && defaultData) || []);
    setOffset(0);
  }, [squash, sort]);

  useEffect(() => {
    getSpecificCluster({
      variables: {
        taskId: specificTaskID,
        props: {
          clusterID,
          sort,
          squash,
        },
        pagination: { offset, limit: 20 },
      },
    });
  }, [offset, sort, squash, clusterID]);

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

  useEffect(() => {
    if (error) {
      showError({
        message: 'Error occurred while loading current cluster',
      });
    }
  }, [error]);

  return (
    <div className={styles.clusterContainer}>
      <Table
        header={
          header && squash
            ? ['Rows count'].concat(
                selectedDependency.map((e) => e.column.name)
              )
            : header
        }
        data={pageRows}
        onScroll={onScroll}
        className={classNames(loading && styles.disabled)}
      />
      <ClusterOptions
        isSorted={sort}
        setIsSorted={setSort}
        isSquashed={squash}
        setIsSquashed={setSquash}
      />
    </div>
  );
};
export default ClusterTable;
