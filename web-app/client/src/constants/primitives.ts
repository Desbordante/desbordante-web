import {
  ARSortBy,
  CFDSortBy,
  OrderBy,
  Pagination,
  SortBy,
  SortSide,
} from "../types/globalTypes";
import { PrimitiveFilter } from "../types/primitives";

export const primitiveTypeList = [
  "Functional Dependencies",
  "Conditional Functional Dependencies",
  "Association Rules",
  "Error Detection Pipeline",
] as const;

export const sortOptions = {
  FD: Object.keys(SortSide) as SortSide[],
  CFD: Object.keys(CFDSortBy) as CFDSortBy[],
  AR: Object.keys(ARSortBy) as ARSortBy[],
  TypoFD: Object.keys(SortSide) as SortSide[],
};

export const defaultPrimitiveFilter: PrimitiveFilter = {
  FD: {
    filterString: null,
    mustContainLhsColIndices: null,
    mustContainRhsColIndices: null,
    orderBy: OrderBy.ASC,
    sortBy: SortBy.COL_NAME,
    sortSide: SortSide.LHS,
    pagination: {
      limit: 10,
      offset: 0,
    },
    withoutKeys: false,
  },
  CFD: {
    filterString: null,
    orderBy: OrderBy.DESC,
    sortBy: CFDSortBy.CONF,
    mustContainRhsColIndices: null,
    mustContainLhsColIndices: null,
    withoutKeys: false,
    pagination: {
      limit: 10,
      offset: 0,
    },
  },
  AR: {
    filterString: null,
    orderBy: OrderBy.DESC,
    sortBy: ARSortBy.DEFAULT,
    pagination: {
      limit: 10,
      offset: 0,
    },
  },
  TypoFD: {
    filterString: null,
    orderBy: OrderBy.DESC,
    sortBy: SortBy.COL_NAME,
    sortSide: SortSide.LHS,
    pagination: {
      limit: 10,
      offset: 0,
    },
  },
};

export const defaultDatasetPagination: Pagination = {
  limit: 100,
  offset: 0,
};

export const ARSortByLabels = {
  [ARSortBy.CONF]: "Confidence",
  [ARSortBy.DEFAULT]: "Default",
  [ARSortBy.LHS_NAME]: "LHS",
  [ARSortBy.RHS_NAME]: "RHS",
};

export const CFDSortByLabels = {
  [CFDSortBy.SUP]: "Support",
  [CFDSortBy.CONF]: "Confidence",
  [CFDSortBy.LHS_COL_NAME]: "LHS",
  [CFDSortBy.RHS_COL_NAME]: "RHS",
}