import classNames from 'classnames';
import { FC, HTMLProps, useReducer } from 'react';
import { Collapse } from 'react-collapse';
import chevronDown from '@assets/icons/chevron-down.svg';
import chevronUp from '@assets/icons/chevron-up.svg';
import Button from '@components/Button';
import { Badge } from '@components/FileStats/Badge';
import { useToggle } from '@components/FileStats/hooks';
import { ModeButton } from '@components/FileStats/ModeButton';
import { Paper } from '@components/FileStats/Paper';
import { StatsBlock } from '@components/FileStats/StatsBlock';
import { getFileStats_datasetInfo_stats as FileStats } from '@graphql/operations/queries/__generated__/getFileStats';
import styles from './ColumnCard.module.scss';

type ColumnCardProps = {
  column: FileStats;
  compact?: boolean;
} & HTMLProps<HTMLDivElement>;

export const ColumnCard: FC<ColumnCardProps> = ({
  className,
  column,
  compact,
  ...props
}: ColumnCardProps) => {
  const [showDetails, toggleDetails] = useReducer(
    (showDetails: boolean) => !showDetails,
    false
  );

  const [tableMode, toggleMode] = useToggle(false);

  const header = (
    <div className={styles.header}>
      <div className={styles['name-with-badges']}>
        <div className={styles.name}>
          <span>#{column.columnIndex + 1}</span>
          <h6>{column.columnName}</h6>
        </div>
        <div className={styles.badges}>
          <Badge mode="secondary">{column.type}</Badge>
          {column.isCategorical && <Badge>Categorical</Badge>}
        </div>
      </div>
      <ModeButton tableMode={tableMode} onClick={toggleMode} />
    </div>
  );

  const content = (
    <div
      className={classNames(styles.content, tableMode && styles['table-mode'])}
    >
      <div className={styles['basic-stats']}>
        <StatsBlock
          tableMode={tableMode}
          stats={[
            { name: 'Distinct', value: column.distinct },
            { name: 'Count', value: column.count },
          ]}
          size="lg"
        />
        <StatsBlock
          tableMode={tableMode}
          stats={[
            { name: 'Avg', value: column.avg },
            { name: 'Std', value: column.STD },
          ]}
          size="lg"
        />
      </div>
      <Collapse isOpened={showDetails || !!compact}>
        <div className={styles['more-stats']}>
          <StatsBlock
            tableMode={tableMode}
            stats={[
              { name: 'Min', value: column.min },
              { name: 'Max', value: column.max },
              { name: 'Quantile 25', value: column.quantile25 },
              { name: 'Quantile 50', value: column.quantile50 },
              { name: 'Quantile 75', value: column.quantile75 },
            ]}
            header="Quantile stats"
          />
          <StatsBlock
            tableMode={tableMode}
            stats={[
              { name: 'Skewness', value: column.skewness },
              { name: 'Kurtosis', value: column.kurtosis },
              { name: 'Sum', value: column.sum },
            ]}
            header="Descriptive stats"
          />
        </div>
      </Collapse>
    </div>
  );

  return (
    <Paper
      className={classNames(
        className,
        styles.wrapper,
        compact && styles.compact
      )}
      {...props}
    >
      {header}

      {content}

      {!compact && (
        <Button
          variant="secondary"
          icon={!showDetails ? chevronDown : chevronUp}
          className={styles['details-button']}
          onClick={toggleDetails}
          aria-label={!showDetails ? 'Show details' : 'Hide details'}
        >
          {!showDetails ? 'Show details' : 'Hide details'}
        </Button>
      )}
    </Paper>
  );
};
