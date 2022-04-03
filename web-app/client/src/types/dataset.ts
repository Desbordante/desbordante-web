import { AllowedDataset } from "./types";
import { Pagination } from "./globalTypes";

export type Dataset = File | AllowedDataset;

export function isBuiltinDataset(dataset: Dataset | undefined) {
  return dataset && (dataset as AllowedDataset).delimiter !== undefined;
}

export function isFile(d: Dataset) {
  return (d as File).name !== undefined;
}

export const defaultDatasetPagination: Pagination = {
  limit: 100,
  offset: 0,
};
