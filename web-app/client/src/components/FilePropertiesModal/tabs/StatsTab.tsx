import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { FC, useEffect, useId, useState } from 'react';
import Button from '@components/Button';
import styles from '@components/FilePropertiesModal/FilePropsView.module.scss';
import { Menu } from '@components/FilePropertiesModal/Menu';
import { OptionWithBadge } from '@components/FilePropertiesModal/OptionWithBadge';
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
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    startPolling,
    stopPolling,
    loading: loadingFileStats,
  } = useQuery<getFileStats, getFileStatsVariables>(GET_FILE_STATS, {
    variables: {
      fileID,
    },
    onCompleted: (fileStats) => {
      const state = fileStats.datasetInfo.statsInfo.state;

      if (state === null) return setStage(Stage.Start);

      if (state.__typename !== 'TaskState') return setError(state.errorStatus);

      if (state.progress !== 100) return setStage(Stage.Processing);

      return setStage(Stage.Show);
    },
    onError: (error) => setError(error.message),
  });

  const [startProcessing, { loading: loadingStartProcessing }] = useMutation<
    startProcessingStats,
    startProcessingStatsVariables
  >(START_PROCESSING_STATS, {
    onCompleted: () => setStage(Stage.Processing),
    onError: (error) => setError(error.message),
  });

  useEffect(() => {
    if (stage === Stage.Processing) startPolling?.(1000);

    if (stage === Stage.Show) stopPolling?.();

    return () => {
      stopPolling?.();
    };
  }, [stage, startPolling, stopPolling]);

  if (loadingFileStats || loadingStartProcessing)
    return (
      <div className={styles.loading}>
        <h5>Loading...</h5>
      </div>
    );

  if (error || !data)
    return (
      <Alert header="Error" variant="error" className={styles.error}>
        {error || 'An unknown error has occurred'}
      </Alert>
    );

  const file = data.datasetInfo;

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

  const taskState = file.statsInfo.state;
  const processing =
    taskState?.__typename === 'TaskState' ? (
      <div className={styles.processing}>
        <div className={styles.processingLabel}>
          <label htmlFor={progressId}>Discovering statistics</label>
          {`${taskState.progress}%`}
        </div>
        <Progress value={taskState.progress} id={progressId} />
      </div>
    ) : null;

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

  const fileStats = file.statsInfo.stats;
  const options: ColumnOption[] = [
    { value: -1, label: 'Overview' },
    ...fileStats.map((column) => ({
      value: column.column.index,
      label: column.column.name,
      type: column.type,
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
          columnStats={
            fileStats.find((column) => column.column.index === selectedColumn)!
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
