import { atom } from 'jotai';
import { MFDSortBy, Pagination } from 'types/globalTypes';

export type MFDHighlight = {
  index: number;
  rowIndex: number;
  withinLimit: boolean;
  maximumDistance: number;
  furthestPointIndex: number;
  value: string;
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
  sortBy: MFDSortBy.FURTHEST_POINT_INDEX,
};

export const MFDAtomDefaultValuesWithParams = (
  taskID: string,
  clusterIndex = 0,
  offset = 0,
  limit = 0,
  sortBy = MFDSortBy.FURTHEST_POINT_INDEX
) => ({
  ...MFDAtomDefaultValues,
  taskID: taskID,
  clusterIndex: clusterIndex,
  pagination: {
    offset: offset,
    limit: limit,
  },
  sortBy: sortBy,
});

const MFDAtom = atom<MFDTaskAtom>(MFDAtomDefaultValues);

export default MFDAtom;
