import { FC, useReducer } from "react";
import styles from "./ColumnCard.module.scss";
import { Badge } from "@components/FileStats/Badge";
import { getFileStats_fileStats } from "@graphql/operations/queries/__generated__/getFileStats";
import Button from "@components/Button";
import chevronDown from "@assets/icons/chevron-down.svg";
import chevronUp from "@assets/icons/chevron-up.svg";
import grid from "@assets/icons/grid.svg";
import list from "@assets/icons/list.svg";
import { Collapse } from "react-collapse";
import classNames from "classnames";
import { Paper } from "@components/FileStats/Paper";
import { StatsBlock, StatsMode } from "@components/FileStats/StatsBlock";

type ColumnCardProps = {
  column: getFileStats_fileStats;
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
          size="lg"
        />
        <StatsBlock
          mode={mode}
          stats={[
            { name: "avg", value: column.avg },
            { name: "std", value: column.STD },
          ]}
          size="lg"
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
    <Paper className={styles.card}>
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
    </Paper>
  );
};
