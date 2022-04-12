import {ARsFilter, FDsFilter, Pagination} from "./globalTypes";

export type PrimitiveFilter = {
  FD: FDsFilter;
  CFD: Pagination;
  AR: ARsFilter;
};
