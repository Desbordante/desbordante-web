import { useLazyQuery } from '@apollo/client';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import ClusterOptions from '@components/ClusterOptions';
import { useTaskContext } from '@components/TaskContext';
import {
  getSpecificCluster,
  getSpecificClusterVariables,
  getSpecificCluster_taskInfo_data_SpecificTaskData_result_specificCluster_SquashedCluster_items,
} from '@graphql/operations/queries/EDP/__generated__/getSpecificCluster';
import { GET_SPECIFIC_CLUSTER } from '@graphql/operations/queries/EDP/getSpecificCluster';
import { useErrorContext } from '@hooks/useErrorContext';
import ScrollableTable from './ScrollableTable';
import styles from './Table.module.scss';

type ClusterTableProps = {
  data: string[][] | undefined;
  totalCount: number;
  specificTaskID: string;
  clusterID: number;
  header?: string[];
};

const DEFAULT_LIMIT = 20;
const LIMIT_INCREMENT = 20;

const ClusterTable: FC<ClusterTableProps> = ({
  data: defaultData,
  totalCount,
  specificTaskID,
  clusterID,
  header,
}) => {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
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
    },
  );
  const pageCompleted =
    pageResult?.taskInfo.data &&
    'result' in pageResult?.taskInfo.data &&
    pageResult?.taskInfo.data.result?.specificCluster &&
    'items' in pageResult?.taskInfo.data.result?.specificCluster;

  type Item =
    getSpecificCluster_taskInfo_data_SpecificTaskData_result_specificCluster_SquashedCluster_items;

  const parseItem = (e: Item) => e.row;
  const parseSquashItem = (e: Item) =>
    ['x' + e.amount].concat(
      selectedDependency.map((column) => e.row[column.column.index]),
    );
  const pageRows =
    pageCompleted &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pageResult?.taskInfo.data.result.specificCluster?.items.map(
      squash ? parseSquashItem : parseItem,
    );

  useEffect(() => {
    setData((!squash && !sort && defaultData) || []);
    setLimit(DEFAULT_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        pagination: { offset: 0, limit },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, sort, squash, clusterID]);

  useEffect(() => {
    if (pageCompleted) {
      // if we got the results, stop polling
      stopPolling();
    } else if (pageResult) {
      // do polling if there is a response but with no results
      startPolling(2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageResult]);

  const onScroll = useCallback(async () => {
    if (limit + LIMIT_INCREMENT < totalCount) {
      setLimit((prev) => prev + LIMIT_INCREMENT);
    }
  }, [totalCount, limit]);

  useEffect(() => {
    if (pageRows) {
      setData(pageRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageResult]);

  useEffect(() => {
    if (error) {
      showError({
        message: 'Error occurred while loading current cluster',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className={styles.clusterContainer}>
      <ScrollableTable
        header={
          header && squash
            ? ['Rows count'].concat(
                selectedDependency.map((e) => e.column.name),
              )
            : header
        }
        data={data}
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
