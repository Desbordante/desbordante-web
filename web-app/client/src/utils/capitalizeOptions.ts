import _ from 'lodash';

export const capitalize = _.capitalize as <T extends string>(
  value: T,
) => Capitalize<Lowercase<T>>;

export type CapitalizedOption<T extends string> = {
  label: Capitalize<Lowercase<T>>;
  value: T;
};
