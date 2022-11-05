import { FC, HTMLProps } from "react";
import styles from "./StatsBlock.module.scss";
import { Statistic, StatisticSize } from "@components/FileStats/Statistic";
import { Table } from "@components/FileStats/Table";

export enum StatsMode {
  Blocks,
  Table,
}

type StatsBlockProps = {
  stats: Array<{ name: string; value: number | string | null }>;
  size?: StatisticSize;
  header?: string;
  mode: StatsMode;
} & Omit<HTMLProps<HTMLDivElement>, "size">;

export const StatsBlock: FC<StatsBlockProps> = ({
  stats,
  size,
  header,
  mode,
  ...props
}: StatsBlockProps) => {
  if (stats.every((item) => item.value === null)) return null;

  const items = stats.map(
    (item) =>
      item.value && (
        <>
          {mode === StatsMode.Blocks && (
            <Statistic header={item.name} size={size}>
              {item.value}
            </Statistic>
          )}

          {mode === StatsMode.Table && (
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

      {mode === StatsMode.Blocks && (
        <div className={styles.blocks}>{items}</div>
      )}

      {mode === StatsMode.Table && <Table>{items}</Table>}
    </article>
  );
};
