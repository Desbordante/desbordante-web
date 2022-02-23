export type BuiltinDataset = {
  ID: string;
  fileName: string;
  hasHeader: boolean;
  delimiter: string;
};

export type Dataset = File | BuiltinDataset;

export function isBuiltinDataset(dataset: Dataset | undefined) {
  return dataset && (dataset as BuiltinDataset).delimiter !== undefined;
}

export function isFile(d: Dataset) {
  return (d as File).name !== undefined;
}
