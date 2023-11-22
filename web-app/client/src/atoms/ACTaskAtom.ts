import { atom } from 'jotai';
import { MFDSortBy, OrderBy, Pagination } from 'types/globalTypes';

export type ACHighlight = {
  index: number;
  rowIndex: number;
  withinLimit: boolean;
  maximumDistance: string;
  furthestPointIndex: number;
  value: string;
  clusterValue: string;
};

export type ACCluster = {
  value: string;
  highlightsTotalCount: number;
  highlights: ACHighlight[];
};

type ACTaskAtom = {
  taskID: string;
  result: boolean | undefined;
  clustersTotalCount: number;
  clusterIndex: number;
  cluster: ACCluster;
  pagination: Pagination;
  sortBy: MFDSortBy;
  orderBy: OrderBy;
};

export const ACAtomDefaultValues: ACTaskAtom = {
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
  orderBy = OrderBy.ASC
) => ({
  ...ACAtomDefaultValues,
  taskID,
  clusterIndex,
  pagination: {
    offset: 0,
    limit,
  },
  sortBy,
  orderBy,
});

const ACAtom = atom<ACTaskAtom>(ACAtomDefaultValues);

export default ACAtom;
