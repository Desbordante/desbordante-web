import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import {
  getFileStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';
import {
  startProcessingStats,
  startProcessingStatsVariables,
} from '@graphql/operations/mutations/__generated__/startProcessingStats';
import { START_PROCESSING_STATS } from '@graphql/operations/mutations/startProcessingStats';
import styles from '@components/FilePropsView/FilePropsView.module.scss';
import { Alert } from '@components/FileStats/Alert';
import NumberSlider from '@components/Inputs/NumberSlider/NumberSlider';
import { Progress } from '@components/FileStats/Progress';
import { Table } from '@components/FileStats/Table';
import { getOverview } from '@utils/fileStats';
import { Select } from '@components/Inputs';
import { OptionWithBadge } from '@components/FilePropsView/OptionWithBadge';
import { Menu } from '@components/FilePropsView/Menu';
import { ColumnCard } from '@components/FileStats/ColumnCard';
import Button from '@components/Button';

type ColumnOption = {
  value: number;
  label: string;
  type?: string;
  categorical?: boolean;
};

type StatsTabProps = {
  fileId: string;
};

enum Stage {
  Start,
  Processing,
  Show,
}

export const StatsTab: FC<StatsTabProps> = ({ fileId }: StatsTabProps) => {
  const router = useRouter();
  const [threadsCount, setThreadsCount] = useState(1);
  const [stage, setStage] = useState<Stage | null>(null);
  const [selectedColumn, setSelectedColumn] = useState(-1);

  const {
    data: fileStats,
    startPolling,
    stopPolling,
    loading,
  } = useQuery<getFileStats, getFileStatsVariables>(GET_FILE_STATS, {
    variables: {
      fileID: fileId,
    },
    onCompleted: (fileStats) => {
      const file = fileStats?.datasetInfo;
      if (!file) return;

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

  const file = fileStats?.datasetInfo;

  if (loading)
    return (
      <div className={styles.loading}>
        <h5>Loading...</h5>
      </div>
    );

  if (!file) return null;

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
        <div className={styles['processing-label']}>
          <span>Discovering statistics</span>
          <span>{file.statsProgress}%</span>
        </div>
        <Progress value={file.statsProgress} />
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
      label: column.columnName ?? '',
      type: column.type ?? '',
      categorical: !!column.isCategorical,
    })),
  ];

  const columns = (
    <>
      <div className={styles['header-with-select']}>
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
                variables: { fileID: fileId, threadsCount },
              })
            }
          >
            Start Processing
          </Button>
        )}
        {stage === Stage.Show && (
          <Button
            onClick={() =>
              router.push(`/create-task/file-stats?fileId=${fileId}`)
            }
          >
            Show More
          </Button>
        )}
      </div>
    </>
  );
};
