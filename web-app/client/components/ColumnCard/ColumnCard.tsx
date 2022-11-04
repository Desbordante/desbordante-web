import { FC, useReducer } from "react";
import styles from "./ColumnCard.module.scss";
import { Badge } from "@components/Badge";
import { Statistic, StatisticSize } from "@components/Statistic";
import { getFileStats_fileStats } from "@graphql/operations/queries/__generated__/getFileStats";
import Button from "@components/Button";
import chevronDown from "@assets/icons/chevron-down.svg";
import chevronUp from "@assets/icons/chevron-up.svg";
import grid from "@assets/icons/grid.svg";
import list from "@assets/icons/list.svg";
import { Collapse } from "react-collapse";
import classNames from "classnames";

type ColumnCardProps = {
  column: getFileStats_fileStats;
};

enum StatsMode {
  Blocks,
  Table,
}

type StatsBlockProps = {
  stats: Array<{ name: string; value: number | string | null }>;
  size?: StatisticSize;
  header?: string;
  mode: StatsMode;
};

const StatsBlock: FC<StatsBlockProps> = ({
  stats,
  size,
  header,
  mode,
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
    <article>
      {header && <p className={styles["stats-header"]}>{header}</p>}

      {mode === StatsMode.Blocks && (
        <div className={styles["stats-blocks"]}>{items}</div>
      )}

      {mode === StatsMode.Table && (
        <table className={styles["stats-table"]}>{items}</table>
      )}
    </article>
  );
};

export const ColumnCard: FC<ColumnCardProps> = ({
  column,
}: ColumnCardProps) => {
  const [showDetails, toggleDetails] = useReducer(
    (showDetails: boolean) => !showDetails,
    false
  );

  const [mode, toggleMode] = useReducer(
    (mode) => (mode === StatsMode.Blocks ? StatsMode.Table : StatsMode.Blocks),
    StatsMode.Blocks
  );

  const header = (
    <div className={styles.header}>
      <div className={styles["name-with-badges"]}>
        <div className={styles.name}>
          <span>#{column.columnIndex + 1}</span>
          <h6>{column.columnName}</h6>
        </div>
        <div className={styles.badges}>
          <Badge mode="secondary">Integer</Badge>
          {column.isCategorical && <Badge>Categorical</Badge>}
        </div>
      </div>
      <Button
        variant="secondary"
        icon={mode === StatsMode.Blocks ? grid : list}
        className={styles["mode-button"]}
        onClick={toggleMode}
      />
    </div>
  );

  const content = (
    <div
      className={classNames(
        styles.content,
        mode === StatsMode.Table && styles["table-mode"]
      )}
    >
      <div className={styles["basic-stats"]}>
        <StatsBlock
          mode={mode}
          stats={[
            { name: "distinct", value: column.distinct },
            { name: "count", value: column.count },
          ]}
          size="big"
        />
        <StatsBlock
          mode={mode}
          stats={[
            { name: "avg", value: column.avg },
            { name: "std", value: column.STD },
          ]}
          size="big"
        />
      </div>
      <Collapse isOpened={showDetails}>
        <div className={styles["more-stats"]}>
          <StatsBlock
            mode={mode}
            stats={[
              { name: "min", value: column.min },
              { name: "max", value: column.max },
              { name: "quantile 25", value: column.quantile25 },
              { name: "quantile 50", value: column.quantile50 },
              { name: "quantile 75", value: column.quantile75 },
            ]}
            header="Quantile stats"
          />
          <StatsBlock
            mode={mode}
            stats={[
              { name: "skewness", value: column.skewness },
              { name: "kurtosis", value: column.kurtosis },
              { name: "sum", value: column.sum },
            ]}
            header="Descriptive stats"
          />
        </div>
      </Collapse>
    </div>
  );

  return (
    <article className={styles.card}>
      {header}

      {content}

      <Button
        variant="secondary"
        icon={!showDetails ? chevronDown : chevronUp}
        className={styles["details-button"]}
        onClick={toggleDetails}
      >
        {!showDetails ? "Show details" : "Hide details"}
      </Button>
    </article>
  );
};
