import { FC, PropsWithChildren } from 'react';
import styles from './Table.module.scss';

type Props = {
  data: string[][] | undefined;
};
const Table: FC<Props> = ({ data }) => {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>{data && data[0].map((e, i) => <th>Column {i + 1}</th>)}</thead>
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
