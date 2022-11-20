import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_SPECIFIC_CLUSTER } from '@graphql/operations/queries/EDP/getSpecificCluster';
import _ from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import {
  getSpecificCluster,
  getSpecificClusterVariables,
} from '@graphql/operations/queries/EDP/__generated__/getSpecificCluster';
import threeDots from '@assets/icons/three-dots.svg';
import Table from './ScrollableTable';
import styles from './Table.module.scss';
import { Checkbox } from '@components/Inputs';

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
  const [showOptions, setShowOptions] = useState(false);

  const [squash, setSquash] = useState(false);
  const [sort, setSort] = useState(false);

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
  const parseSquashItem = (e: any) => ['x' + e.amount].concat(e.row);
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

  return (
    <div className={styles.clusterContainer}>
      <Table
        header={header && squash ? ['Rows count'].concat(header) : header}
        {...{ data, onScroll }}
        className={classNames(loading && styles.disabled)}
      />

      <div className={styles.options}>
        <Image
          onClick={() => setShowOptions((e) => !e)}
          src={threeDots}
          width={24}
          height={24}
        />
        {showOptions && (
          <div
            onClick={() => setShowOptions(false)}
            className={styles.optionsOverlay}
          ></div>
        )}

        {showOptions && (
          <div className={styles.optionsDropdown}>
            <Checkbox
              label="Sorted"
              checked={sort}
              id="ClusterTableSortedCheckbox"
              onChange={() => setSort((sorted) => !sorted)}
            />

            <Checkbox
              label="Squashed"
              checked={squash}
              id="ClusterTableSquashedCheckbox"
              onChange={() => setSquash((squashed) => !squashed)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default ClusterTable;
