import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_SPECIFIC_CLUSTER } from '@graphql/operations/queries/EDP/getSpecificCluster';
import {
  getSpecificCluster,
  getSpecificClusterVariables,
} from '@graphql/operations/queries/EDP/__generated__/getSpecificCluster';
import classNames from 'classnames';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import styles from './Table.module.scss';

type Props = {
  data: string[][] | undefined;
  specificTaskID: string;
  clusterID: number;
};
const Table: FC<Props> = ({ data: defaultData, specificTaskID, clusterID }) => {
  const {
    data: pageResult,
    error,
    startPolling,
    stopPolling,
    refetch,
  } = useQuery<getSpecificCluster, getSpecificClusterVariables>(
    GET_SPECIFIC_CLUSTER,
    { fetchPolicy: 'network-only' }
  );

  const [isScrolled, setIsScrolled] = useState(false);
  const [data, setData] = useState(defaultData || []);
  const [offset, setOffset] = useState(0);

  const [totalCount, pageRows] = (pageResult?.taskInfo.data &&
    'result' in pageResult?.taskInfo.data &&
    pageResult?.taskInfo.data.result?.specificCluster &&
    'items' in pageResult?.taskInfo.data.result?.specificCluster && [
      pageResult?.taskInfo.data.result?.specificCluster.itemsAmount,
      pageResult?.taskInfo.data.result?.specificCluster?.items.map(
        (e) => e.row
      ),
    ]) || [0, undefined];

  useEffect(() => {
    if (!isScrolled) return;
    if (totalCount < offset + 20) {
      setOffset((offset) => offset + 20);
    }
  }, [isScrolled]);

  useEffect(() => {
    if (offset > 0) {
      refetch({
        taskId: specificTaskID,
        props: {
          clusterID,
          sort: true,
          squash: false,
        },
        pagination: { offset, limit: 20 },
      });
      startPolling(2000);
    }
  }, [offset]);

  useEffect(() => {
    if (pageRows) {
      stopPolling();
      setData(data.concat(pageRows));
    }
  }, [pageRows]);

  return (
    <div
      className={classNames(styles.container, isScrolled && styles.disabled)}
      onScroll={(e) =>
        setIsScrolled(
          Math.abs(
            e.currentTarget.scrollTop -
              (e.currentTarget.scrollHeight - e.currentTarget.clientHeight)
          ) < 100
        )
      }
    >
      <table className={styles.table}>
        <thead>
          <tr>{data && data[0].map((e, i) => <td>Column {i + 1}</td>)}</tr>
        </thead>
        <tbody>
          {data &&
            data.map((row) => (
              <tr>
                {row.map((e) => (
                  <td>{e}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
