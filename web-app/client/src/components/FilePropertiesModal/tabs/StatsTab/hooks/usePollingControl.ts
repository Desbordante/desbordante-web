import { useEffect } from 'react';
import { StatsStage } from '@components/FilePropertiesModal/tabs/StatsTab';

export const usePollingControl = (
  stage: StatsStage | null,
  startPolling?: (pollInterval: number) => void,
  stopPolling?: () => void,
) =>
  useEffect(() => {
    if (stage === StatsStage.Processing) startPolling?.(1000);

    if (stage === StatsStage.Show) stopPolling?.();

    return () => {
      stopPolling?.();
    };
  }, [stage, startPolling, stopPolling]);
