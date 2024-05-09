import { MutationHookOptions, useMutation } from '@apollo/client';
import {
  startProcessingStats,
  startProcessingStatsVariables,
} from '@graphql/operations/mutations/__generated__/startProcessingStats';
import { START_PROCESSING_STATS } from '@graphql/operations/mutations/startProcessingStats';

export const useStartProcessing = (
  options: MutationHookOptions<
    startProcessingStats,
    startProcessingStatsVariables
  >,
) =>
  useMutation<startProcessingStats, startProcessingStatsVariables>(
    START_PROCESSING_STATS,
    options,
  );
