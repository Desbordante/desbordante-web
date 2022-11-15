import { FC, HTMLProps } from 'react';
import styles from './StatsBlock.module.scss';
import { Statistic, StatisticSize } from '@components/FileStats/Statistic';
import { Table } from '@components/FileStats/Table';
import { StatType } from 'types/fileStats';

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
    (item) =>
      item.value && (
        <>
          {!tableMode && (
            <Statistic header={item.name} size={size}>
              {item.value}
            </Statistic>
          )}

          {tableMode && (
            <tr>
              <th>{item.name}</th>
              <td>{item.value}</td>
            </tr>
          )}
        </>
      )
  );

  return (
    <article {...props}>
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
