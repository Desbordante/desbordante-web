import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { FC, useEffect, useId, useState } from 'react';
import Button from '@components/Button';
import styles from '@components/FilePropsView/FilePropsView.module.scss';
import { Menu } from '@components/FilePropsView/Menu';
import { OptionWithBadge } from '@components/FilePropsView/OptionWithBadge';
import { Alert } from '@components/FileStats/Alert';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import { Progress } from '@components/FileStats/Progress';
import { Table } from '@components/FileStats/Table';
import { Select } from '@components/Inputs';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import {
  startProcessingStats,
  startProcessingStatsVariables,
} from '@graphql/operations/mutations/__generated__/startProcessingStats';
import { START_PROCESSING_STATS } from '@graphql/operations/mutations/startProcessingStats';
import {
  getFileStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import { getOverview } from '@utils/fileStats';

export type ColumnOption = {
  value: number;
  label: string;
  type?: string;
  isCategorical?: boolean;
};

type StatsTabProps = {
  fileID: string;
};

enum Stage {
  Start,
  Processing,
  Show,
}

export const StatsTab: FC<StatsTabProps> = ({ fileID }: StatsTabProps) => {
  const router = useRouter();
  const [threadsCount, setThreadsCount] = useState(1);
  const [stage, setStage] = useState<Stage | null>(null);
  const [selectedColumn, setSelectedColumn] = useState(-1);
  const progressId = useId();

  const {
    data: fileStats,
    startPolling,
    stopPolling,
    loading,
    error,
  } = useQuery<getFileStats, getFileStatsVariables>(GET_FILE_STATS, {
    variables: {
      fileID: fileID,
    },
    onCompleted: (fileStats) => {
      const file = fileStats.datasetInfo!;

      if (!file.hasStats) return setStage(Stage.Start);

      if (file.statsProgress !== 100) return setStage(Stage.Processing);

      return setStage(Stage.Show);
    },
  });

  const [startProcessing] = useMutation<
    startProcessingStats,
    startProcessingStatsVariables
  >(START_PROCESSING_STATS, {
    onCompleted: () => setStage(Stage.Processing),
  });

  useEffect(() => {
    if (stage === Stage.Processing) startPolling?.(1000);

    if (stage === Stage.Show) stopPolling?.();
  }, [stage]);

  if (loading)
    return (
      <div className={styles.loading}>
        <h5>Loading...</h5>
      </div>
    );

  const file = fileStats?.datasetInfo;

  if (error || !file)
    return (
      <Alert header="Error" variant="error" className={styles.error}>
        {error?.message || 'An unknown error has occurred'}
      </Alert>
    );

  const start = (
    <>
      <Alert>
        Statistics have not been processed yet.
        <br />
        Would you like to start processing?
      </Alert>
      <NumberSlider
        sliderProps={{ min: 1, max: 9, step: 1 }}
        label="Thread count"
        value={threadsCount}
        onChange={(value) => setThreadsCount(Math.round(value))}
      />
    </>
  );

  const processing = (
    <>
      <div className={styles.processing}>
        <div className={styles.processingLabel}>
          <label htmlFor={progressId}>Discovering statistics</label>
          {`${file.statsProgress}%`}
        </div>
        <Progress value={file.statsProgress} id={progressId} />
      </div>
    </>
  );

  const overview = (
    <Table>
      <tbody>
        {getOverview(file).map((item) => (
          <tr key={item.name}>
            <th>{item.name}</th>
            <td>{item.value}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const options: ColumnOption[] = [
    { value: -1, label: 'Overview' },
    ...file.stats.map((column) => ({
      value: column.columnIndex,
      label: column.columnName!,
      type: column.type!,
      isCategorical: !!column.isCategorical,
    })),
  ];

  const columns = (
    <>
      <div className={styles.headerWithSelect}>
        <h5>Columns</h5>
        <Select
          isSearchable={false}
          value={options.find((option) => option.value === selectedColumn)}
          onChange={(e) => setSelectedColumn((e as ColumnOption).value)}
          options={options}
          components={{ Option: OptionWithBadge, Menu }}
        />
      </div>

      {selectedColumn === -1 && overview}
      {selectedColumn !== -1 && (
        <ColumnCard
          data-testid="column-card"
          column={
            file.stats.find((column) => column.columnIndex === selectedColumn)!
          }
          compact
        />
      )}
    </>
  );

  return (
    <>
      <div className={styles.stats}>
        {stage === Stage.Start && start}
        {stage === Stage.Processing && processing}
        {stage === Stage.Show && columns}
      </div>
      <div className={styles.buttonsRow}>
        {stage !== Stage.Show && (
          <Button
            disabled={stage !== Stage.Start}
            onClick={() =>
              startProcessing({
                variables: { fileID: fileID, threadsCount },
              })
            }
          >
            Start Processing
          </Button>
        )}
        {stage === Stage.Show && (
          <Button
            onClick={() =>
              router.push(`/create-task/file-stats?fileID=${fileID}`)
            }
          >
            Show More
          </Button>
        )}
      </div>
    </>
  );
};
