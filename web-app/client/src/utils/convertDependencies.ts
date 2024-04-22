import { AR } from '@graphql/operations/fragments/__generated__/AR';
import { CFD } from '@graphql/operations/fragments/__generated__/CFD';
import { Column } from '@graphql/operations/fragments/__generated__/Column';
import { FD } from '@graphql/operations/fragments/__generated__/FD';
import { GetMainTaskDeps } from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import { PrimitiveType } from 'types/globalTypes';

export type GeneralColumn = {
  column: Column;
  pattern?: string;
};

type FilteredDeps = {
  filteredDepsAmount: number;
  FDs: [FD];
  CFDs: [CFD];
  ARs: [AR];
  TypoFDs: [FD];
  TypoClusters: [FD];
};

const getFilteredDeps: (
  data: GetMainTaskDeps,
  type: PrimitiveType,
) => FilteredDeps = (data, type) => {
  const { result } = data.taskInfo.data;
  if (!result || result.__typename !== (`${type}TaskResult` as const)) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return result.filteredDeps;
};

export const convertDependencies: (
  primitive?: PrimitiveType,
  shownData?: GetMainTaskDeps,
) => {
  // Can't recreate explicit type
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  confidence?: any;
  rhs: GeneralColumn[];
  lhs: GeneralColumn[];
}[] = (primitive, shownData) => {
  if (!shownData || !primitive) return [];

  const deps = getFilteredDeps(shownData, primitive);

  if (primitive === PrimitiveType.FD) {
    return deps.FDs.map(({ lhs, rhs }) => ({
      rhs: [{ column: rhs }],
      lhs: lhs.map((column) => ({ column })),
    }));
  }

  if (primitive === PrimitiveType.TypoFD) {
    return deps.FDs.map(({ rhs, lhs }) => ({
      rhs: [{ column: rhs }],
      lhs: lhs.map((column) => ({ column })),
    }));
  }

  if (primitive === PrimitiveType.CFD) {
    return deps.CFDs.map(({ rhs, lhs }) => ({
      rhs: [rhs],
      lhs,
    }));
  }

  if (primitive === PrimitiveType.AR) {
    return deps.ARs.map(({ rhs, lhs, confidence }) => ({
      confidence,
      rhs: rhs.map((name, index) => ({
        column: { __typename: 'Column', name, index },
      })),
      lhs: lhs.map((name, index) => ({
        column: { __typename: 'Column', name, index },
      })),
    }));
  }
  return [];
};
