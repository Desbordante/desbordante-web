import { FC, useReducer } from "react";
import styles from "./ColumnCard.module.scss";
import { Badge } from "@components/Badge";
import { Statistic } from "@components/Statistic";
import { getFileStats_fileStats } from "@graphql/operations/queries/__generated__/getFileStats";
import Button from "@components/Button";
import chevronDown from "@assets/icons/chevron-down.svg";
import chevronUp from "@assets/icons/chevron-up.svg";

type ColumnCardProps = {
  column: getFileStats_fileStats;
};

type StatsBlockProps = {
  stats: Array<{ name: string; value: number | string | null }>;
  size?: "big" | "compact";
  header?: string;
};

const StatsBlock: FC<StatsBlockProps> = ({
  stats,
  size,
  header,
}: StatsBlockProps) => (
  <article>
    {header && <p className={styles["stats-header"]}>{header}</p>}
    <div className={styles["stats"]}>
      {stats.map(
        (item) =>
          item.value && (
            <Statistic header={item.name} size={size}>
              {item.value}
            </Statistic>
          )
      )}
    </div>
  </article>
);

export const ColumnCard: FC<ColumnCardProps> = ({
  column,
}: ColumnCardProps) => {
  const [showDetails, toggleDetails] = useReducer(
    (showDetails: boolean) => !showDetails,
    false
  );

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.name}>
          <span>#{column.columnIndex + 1}</span>
          <h6>{column.columnName}</h6>
        </div>
        <div className={styles.badges}>
          <Badge mode="secondary">Integer</Badge>
          {column.isCategorical && <Badge>Categorical</Badge>}
        </div>
      </div>

      <div className={styles.content}>
        <StatsBlock
          stats={[
            { name: "distinct", value: column.distinct },
            { name: "count", value: column.count },
            { name: "avg", value: column.avg },
            { name: "std", value: column.STD },
          ]}
          size="big"
        />
        {showDetails && (
          <div className={styles["more-stats"]}>
            <StatsBlock
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
              stats={[
                { name: "skewness", value: column.skewness },
                { name: "kurtosis", value: column.kurtosis },
                { name: "sum", value: column.sum },
              ]}
              header="Descriptive stats"
            />
          </div>
        )}
      </div>

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
