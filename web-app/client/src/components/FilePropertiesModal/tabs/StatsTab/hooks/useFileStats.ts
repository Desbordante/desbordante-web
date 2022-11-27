import { useQuery } from '@apollo/client';
import { Dispatch, SetStateAction } from 'react';
import { StatsStage } from '@components/FilePropertiesModal/StatsTab';
import {
  getFileStats,
  getFileStatsVariables,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { GET_FILE_STATS } from '@graphql/operations/queries/getFileStats';

export const useFileStats = (
  fileID: string,
  setStage: Dispatch<SetStateAction<StatsStage | null>>,
  setError: Dispatch<SetStateAction<string | null>>
) =>
  useQuery<getFileStats, getFileStatsVariables>(GET_FILE_STATS, {
    variables: {
      fileID,
    },
    onCompleted: (fileStats) => {
      const state = fileStats.datasetInfo.statsInfo.state;

      if (state === null) return setStage(StatsStage.Start);

      if (state.__typename !== 'TaskState') return setError(state.errorStatus);

      if (state.progress !== 100) return setStage(StatsStage.Processing);

      return setStage(StatsStage.Show);
    },
    onError: (error) => setError(error.message),
  });
