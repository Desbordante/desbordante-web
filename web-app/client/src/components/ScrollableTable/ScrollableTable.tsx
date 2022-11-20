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

type Props = {
  data: string[][] | undefined;
  header?: string[];
  onScroll: () => void;
  className?: string;
};

const Table: FC<Props> = ({ data, header, onScroll, className }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isScrolled) {
      onScroll();
    }
  }, [isScrolled]);
  return (
    <div
      className={classNames(styles.container, className)}
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
          <tr>{header && header.map((e) => <td>{e}</td>)}</tr>
          <tr>
            {!header && data && data[0].map((e, i) => <td>Column {i}</td>)}
          </tr>
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
