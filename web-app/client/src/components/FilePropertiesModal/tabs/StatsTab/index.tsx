import { FC, useState } from 'react';
import { useFileStats, usePollingControl, useStartProcessing } from './hooks';
import {
  ErrorStage,
  LoadingStage,
  ProcessingStage,
  ShowStage,
  StartStage,
} from './stages';

type StatsTabProps = {
  fileID: string;
};

export enum StatsStage {
  Start,
  Processing,
  Show,
}

export const StatsTab: FC<StatsTabProps> = ({ fileID }: StatsTabProps) => {
  const [stage, setStage] = useState<StatsStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    startPolling,
    stopPolling,
    loading: loadingFileStats,
  } = useFileStats(fileID, setStage, setError);

  const [startProcessing, { loading: loadingStartProcessing }] =
    useStartProcessing({
      onCompleted: () => setStage(StatsStage.Processing),
      onError: (error) => setError(error.message),
    });

  // Start and stop polling
  usePollingControl(stage, startPolling, stopPolling);

  if (loadingFileStats || loadingStartProcessing) return <LoadingStage />;

  if (error || !data) return <ErrorStage error={error} />;

  const start = (
    <StartStage
      onStart={(threadsCount) =>
        startProcessing({
          variables: { fileID: fileID, threadsCount },
        })
      }
    />
  );

  const datasetInfo = data.datasetInfo;

  const taskState = datasetInfo.statsInfo.state;

  const processing =
    taskState !== null ? (
      <ProcessingStage taskState={taskState} />
    ) : (
      <LoadingStage />
    );

  const show = <ShowStage datasetInfo={datasetInfo} />;

  return (
    <>
      {stage === StatsStage.Start && start}
      {stage === StatsStage.Processing && processing}
      {stage === StatsStage.Show && show}
    </>
  );
};
