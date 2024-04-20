import { FC, HTMLProps } from 'react';
import { Statistic, StatisticSize } from '@components/FileStats/Statistic';
import { Table } from '@components/FileStats/Table';
import { StatType } from 'types/fileStats';
import styles from './StatsBlock.module.scss';

type StatsBlockProps = {
  stats: StatType[];
  size?: StatisticSize;
  header?: string;
  tableMode?: boolean;
} & Omit<HTMLProps<HTMLDivElement>, 'size'>;

export const StatsBlock: FC<StatsBlockProps> = ({
  stats,
  size,
  header,
  tableMode,
  ...props
}: StatsBlockProps) => {
  if (stats.every((item) => item.value === null)) return null;

  const items = stats.map(
    (item, index) =>
      item.value !== null &&
      item.value !== undefined &&
      (tableMode ? (
        <tr key={index}>
          <th>{item.name}</th>
          <td>{item.value}</td>
        </tr>
      ) : (
        <Statistic header={item.name} size={size} key={index}>
          {item.value}
        </Statistic>
      )),
  );

  return (
    <article {...props} data-testid="stats-block">
      {header && <p className={styles.header}>{header}</p>}

      {!tableMode && <div className={styles.blocks}>{items}</div>}

      {tableMode && (
        <Table>
          <tbody>{items}</tbody>
        </Table>
      )}
    </article>
  );
};
