import {
  ARSortBy,
  CFDSortBy,
  FDSortBy,
  PrimitiveType,
} from "types/globalTypes";

export const OrderingTitles: Record<PrimitiveType, Record<string, string>> = {
  [PrimitiveType.FD]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
  [PrimitiveType.CFD]: {
    [CFDSortBy.LHS_COL_NAME]: "LHS NAME",
    [CFDSortBy.RHS_COL_NAME]: "RHS NAME",
    [CFDSortBy.CONF]: "Condfidence",
    [CFDSortBy.LHS_PATTERN]: "LHS PATTERN",
    [CFDSortBy.LHS_PATTERN]: "RHS PATTERN",
  },
  [PrimitiveType.AR]: {
    [ARSortBy.CONF]: "Confidence",
    [ARSortBy.DEFAULT]: "Default",
    [ARSortBy.LHS_NAME]: "LHS NAME",
    [ARSortBy.RHS_NAME]: "RHS NAME",
  },
  [PrimitiveType.TypoFD]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
  [PrimitiveType.TypoCluster]: {
    [FDSortBy.LHS_NAME]: "LHS NAME",
    [FDSortBy.RHS_NAME]: "RHS NAME",
  },
};
