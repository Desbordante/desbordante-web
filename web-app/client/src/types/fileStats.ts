import { Option } from 'types/inputs';

export type StatType = {
  name: string;
  value: number | string | null | undefined;
};

export type ColumnOption = Option<number> & {
  type?: string;
  isCategorical?: boolean;
};
