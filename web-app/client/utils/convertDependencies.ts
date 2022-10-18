import { GetMainTaskDeps } from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import _ from 'lodash';
import { Column } from '@graphql/operations/fragments/__generated__/Column';
import { PrimitiveType } from 'types/globalTypes';

export type GeneralColumn = {
  column: Column;
  pattern?: string;
};

export const convertDependencies: (
  primitive?: PrimitiveType,
  shownData?: GetMainTaskDeps
) => {
  confidence?: any;
  rhs: GeneralColumn[];
  lhs: GeneralColumn[];
}[] = (primitive, shownData) => {
  if (!shownData || !primitive) return [];
  if (primitive === PrimitiveType.FD) {
    return shownData.taskInfo.data.result?.__typename === 'FDTaskResult' &&
      shownData.taskInfo.data.result.filteredDeps.__typename === 'FilteredFDs'
      ? shownData.taskInfo.data.result.filteredDeps.FDs.map((e) => ({
          rhs: [{ column: e.rhs }],
          lhs: e.lhs.map((e) => ({ column: e })),
        }))
      : [];
  }

  if (primitive === PrimitiveType.TypoFD) {
    return shownData.taskInfo.data.result?.__typename === 'TypoFDTaskResult' &&
      shownData.taskInfo.data.result.filteredDeps.__typename === 'FilteredFDs'
      ? shownData.taskInfo.data.result.filteredDeps.FDs.map((e) => ({
          rhs: [{ column: e.rhs }],
          lhs: e.lhs.map((e) => ({ column: e })),
        }))
      : [];
  }

  if (primitive === PrimitiveType.CFD) {
    return shownData.taskInfo.data.result?.__typename === 'CFDTaskResult' &&
      shownData.taskInfo.data.result.filteredDeps.__typename === 'FilteredCFDs'
      ? shownData.taskInfo.data.result.filteredDeps.CFDs.map((e) => ({
          rhs: [e.rhs],
          lhs: e.lhs,
        }))
      : [];
  }

  if (primitive === PrimitiveType.AR) {
    return shownData.taskInfo.data.result?.__typename === 'ARTaskResult' &&
      shownData.taskInfo.data.result.filteredDeps.__typename === 'FilteredARs'
      ? shownData.taskInfo.data.result.filteredDeps.ARs.map((e) => ({
          confidence: e.confidence,
          rhs: e.rhs.map((name) => ({ column: { name } } as GeneralColumn)),
          lhs: e.lhs.map((name) => ({ column: { name } } as GeneralColumn)),
        }))
      : [];
  }
  return [];
};
