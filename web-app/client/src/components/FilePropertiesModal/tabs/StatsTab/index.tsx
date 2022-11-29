import { FC, useState } from 'react';
import { getFileStats_datasetInfo_statsInfo_state_TaskState as TaskState } from '@graphql/operations/queries/__generated__/getFileStats';
import { MainPrimitiveType } from 'types/globalTypes';
import { useFileStats, usePollingControl, useStartProcessing } from './hooks';
import {
  ErrorStage,
  LoadingStage,
  NotSupportedStage,
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

  const startStage = (
    <StartStage
      maxThreadsCount={data.algorithmsConfig.maxThreadsCount}
      onStart={(threadsCount) =>
        startProcessing({
          variables: { fileID, threadsCount },
        })
      }
    />
  );

  const { datasetInfo } = data;

  const { supportedPrimitives } = datasetInfo;

  // Not supported
  if (!supportedPrimitives.includes(MainPrimitiveType.Stats))
    return <NotSupportedStage />;

  const { state: taskState } = datasetInfo.statsInfo;

  return (
    <>
      {/* Start stage */}
      {stage === StatsStage.Start && startStage}

      {/* Processing stage */}
      {stage === StatsStage.Processing &&
        (taskState !== null ? (
          <ProcessingStage taskState={taskState as TaskState} /> // is guaranteed to be TaskState
        ) : (
          <LoadingStage />
        ))}

      {/* Show stage */}
      {stage === StatsStage.Show && <ShowStage datasetInfo={datasetInfo} />}
    </>
  );
};
