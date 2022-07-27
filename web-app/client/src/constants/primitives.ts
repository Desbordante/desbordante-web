import {
  ARSortBy,
  CFDSortBy,
  FDSortBy,
  IntersectionFilter,
  MainPrimitiveType,
  OrderBy,
  Pagination
} from "../types/globalTypes";

export const primitiveTypeList = [
  "Functional Dependencies",
  "Conditional Functional Dependencies",
  "Association Rules",
  "Error Detection Pipeline",
] as const;

export const defaultIntersectionFilter: IntersectionFilter = {
  pagination: {
    offset: 0,
    limit: 10,
  },
  filterString: "",
  orderBy: OrderBy.DESC,
  withoutKeys: true,
  mustContainRhsColIndices: null,
  mustContainLhsColIndices: null,
};

const getSpecificDefaultFilterParams = (type: MainPrimitiveType): Partial<IntersectionFilter> => {
  switch (type) {
    case "AR":
      return {
        ARSortBy: ARSortBy.CONF,
      }
    case "FD":
    case "TypoFD":
      return {
        orderBy: OrderBy.ASC,
        mustContainLhsColIndices: null,
        mustContainRhsColIndices: null,
        withoutKeys: true,
        FDSortBy: FDSortBy.LHS_NAME,
      }
    case "CFD":
      return {
        CFDSortBy: CFDSortBy.CONF,
      }
    default:
      throw new Error("Unreachable code");
  }
}

export const getDefaultFilterParams = (type: MainPrimitiveType): IntersectionFilter =>
    ({
    ...defaultIntersectionFilter,
    ...getSpecificDefaultFilterParams(type),
  });

export const defaultDatasetPagination: Pagination = {
  limit: 100,
  offset: 0,
};

export const setFilterParams = (params: Partial<IntersectionFilter>) =>
    (filter: IntersectionFilter) => ({...filter, ...params});

export const sortByLabels = {
  [MainPrimitiveType.AR]: {
    [ARSortBy.CONF]: "Confidence",
    [ARSortBy.LHS_NAME]: "LHS",
    [ARSortBy.RHS_NAME]: "RHS",
  },
  [MainPrimitiveType.FD]: {
    [FDSortBy.LHS_NAME]: "LHS",
    [FDSortBy.RHS_NAME]: "RHS",
  },
  [MainPrimitiveType.CFD]: {
    [CFDSortBy.SUP]: "Support",
    [CFDSortBy.CONF]: "Confidence",
    [CFDSortBy.LHS_COL_NAME]: "LHS",
    [CFDSortBy.RHS_COL_NAME]: "RHS",
  }
} as const;

export const getSpecificSortByLabels = <T extends keyof typeof sortByLabels>(type: T) => sortByLabels[type]

export type SortByLabelsType<T extends keyof typeof sortByLabels> = keyof ReturnType<typeof getSpecificSortByLabels<T>>;

export type CFDSortByLabelsType = SortByLabelsType<MainPrimitiveType.CFD>;
export type FDSortByLabelsType = SortByLabelsType<MainPrimitiveType.FD>;
export type ARSortByLabelsType = SortByLabelsType<MainPrimitiveType.AR>

export const sortOptions = {
  FD: Object.keys(FDSortBy) as FDSortByLabelsType[],
  CFD: Object.keys(CFDSortBy) as CFDSortByLabelsType[],
  AR: Object.keys(ARSortBy) as ARSortByLabelsType[],
};
