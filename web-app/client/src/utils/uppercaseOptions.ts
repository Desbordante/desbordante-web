import _ from 'lodash';

export const upperCase = _.upperCase as <T extends string>(
  value: T,
) => Uppercase<T>;

export type UpperCaseOption<T extends string> = {
  label: T;
  value: Uppercase<T>;
};
