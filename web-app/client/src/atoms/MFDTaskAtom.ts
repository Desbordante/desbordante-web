import { atom } from 'jotai';
import { MFDSortBy, OrderBy, Pagination } from 'types/globalTypes';

export type MFDHighlight = {
  index: number;
  rowIndex: number;
  withinLimit: boolean;
  maximumDistance: string;
  furthestPointIndex: number;
  value: string;
  clusterValue: string;
};

export type MFDCluster = {
  value: string;
  highlightsTotalCount: number;
  highlights: MFDHighlight[];
};

type MFDTaskAtom = {
  taskID: string;
  result: boolean | undefined;
  clustersTotalCount: number;
  clusterIndex: number;
  cluster: MFDCluster;
  pagination: Pagination;
  sortBy: MFDSortBy;
  orderBy: OrderBy;
};

export const MFDAtomDefaultValues: MFDTaskAtom = {
  // general task data
  taskID: '',
  result: undefined,
  clustersTotalCount: 0,
  // current cluster data
  clusterIndex: 0,
  cluster: {
    value: '',
    highlightsTotalCount: 0,
    highlights: [],
  },
  pagination: {
    offset: 0,
    limit: 0,
  },
  sortBy: MFDSortBy.MAXIMUM_DISTANCE,
  orderBy: OrderBy.ASC,
};

export const MFDAtomDefaultValuesWithParams = (
  taskID: string,
  clusterIndex = 0,
  limit = 0,
  sortBy = MFDSortBy.MAXIMUM_DISTANCE,
  orderBy = OrderBy.ASC,
) => ({
  ...MFDAtomDefaultValues,
  taskID,
  clusterIndex,
  pagination: {
    offset: 0,
    limit,
  },
  sortBy,
  orderBy,
});

const MFDAtom = atom<MFDTaskAtom>(MFDAtomDefaultValues);

export default MFDAtom;
