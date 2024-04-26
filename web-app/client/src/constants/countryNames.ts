import { countries } from 'countries-list';

export const countryNames = Object.entries(countries).map(
  ([, country]) => country,
);
