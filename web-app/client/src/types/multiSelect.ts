import { Option } from 'types/inputs';

export type Badge = {
  label: string;
  style?: string;
};

export type OptionWithBadges = Option<string | number | boolean> & {
  badges?: Badge[];
};
