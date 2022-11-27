export type StatType = {
  name: string;
  value: number | string | null | undefined;
};

export type ColumnOption = {
  value: number;
  label: string;
  type?: string;
  isCategorical?: boolean;
};
