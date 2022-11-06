import { FC, useReducer } from "react";
import styles from "./ColumnCard.module.scss";
import { Badge } from "@components/FileStats/Badge";
import { getFileStats_fileStats } from "@graphql/operations/queries/__generated__/getFileStats";
import Button from "@components/Button";
import chevronDown from "@assets/icons/chevron-down.svg";
import chevronUp from "@assets/icons/chevron-up.svg";
import { Collapse } from "react-collapse";
import classNames from "classnames";
import { Paper } from "@components/FileStats/Paper";
import { StatsBlock } from "@components/FileStats/StatsBlock";
import { ModeButton } from "@components/FileStats/ModeButton";
import { useToggle } from "@components/FileStats/hooks";

type ColumnCardProps = {
  column: getFileStats_fileStats;
  compact?: boolean;
};

export const ColumnCard: FC<ColumnCardProps> = ({
  column,
  compact,
}: ColumnCardProps) => {
  const [showDetails, toggleDetails] = useReducer(
    (showDetails: boolean) => !showDetails,
    false
  );

  const [tableMode, toggleMode] = useToggle(false);

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
      <ModeButton tableMode={tableMode} onClick={toggleMode} />
    </div>
  );

  const content = (
    <div
      className={classNames(styles.content, tableMode && styles["table-mode"])}
    >
      <div className={styles["basic-stats"]}>
        <StatsBlock
          tableMode={tableMode}
          stats={[
            { name: "Distinct", value: column.distinct },
            { name: "Count", value: column.count },
          ]}
          size="lg"
        />
        <StatsBlock
          tableMode={tableMode}
          stats={[
            { name: "Avg", value: column.avg },
            { name: "Std", value: column.STD },
          ]}
          size="lg"
        />
      </div>
      <Collapse isOpened={showDetails}>
        <div className={styles["more-stats"]}>
          <StatsBlock
            tableMode={tableMode}
            stats={[
              { name: "Min", value: column.min },
              { name: "Max", value: column.max },
              { name: "Quantile 25", value: column.quantile25 },
              { name: "Quantile 50", value: column.quantile50 },
              { name: "Quantile 75", value: column.quantile75 },
            ]}
            header="Quantile stats"
          />
          <StatsBlock
            tableMode={tableMode}
            stats={[
              { name: "Skewness", value: column.skewness },
              { name: "Kurtosis", value: column.kurtosis },
              { name: "Sum", value: column.sum },
            ]}
            header="Descriptive stats"
          />
        </div>
      </Collapse>
    </div>
  );

  return (
    <Paper className={classNames(styles.wrapper, compact && styles.compact)}>
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
