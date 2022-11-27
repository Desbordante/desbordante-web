import { getFileStats_datasetInfo } from '@graphql/operations/queries/__generated__/getFileStats';
import { StatType } from 'types/fileStats';

export const getOverview = (file: getFileStats_datasetInfo): StatType[] => [
  { name: 'Number of columns', value: file.countOfColumns },
];
