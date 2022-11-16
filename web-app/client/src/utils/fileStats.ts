import { getFileStats_datasetInfo } from '@graphql/operations/queries/__generated__/getFileStats';
import { StatType } from 'types/fileStats';

export const getOverview = (file: getFileStats_datasetInfo): StatType[] => [
  { name: 'Number of columns', value: file.countOfColumns },
  { name: 'Categoricals', value: file.overview?.categoricals },
  { name: 'Integers', value: file.overview?.integers },
  { name: 'Strings', value: file.overview?.strings },
  { name: 'Floats', value: file.overview?.floats },
];
