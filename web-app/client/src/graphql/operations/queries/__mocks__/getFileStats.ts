import {
  getFileStats,
  getFileStats_datasetInfo,
} from '@graphql/operations/queries/__generated__/getFileStats';
import { GraphQLError } from 'graphql';

const fileStatsMock: getFileStats = {
  datasetInfo: {
    __typename: 'DatasetInfo',
    fileID: 'f7410bff-873a-4299-82dc-fc1f21b44cd1',
    fileName: 'SimpleTypos.csv',
    hasStats: false,
    statsProgress: 0,
    countOfColumns: 3,
    overview: {
      __typename: 'FileOverview',
      categoricals: 5,
      integers: 4,
      floats: 3,
      strings: 3,
    },
    stats: [
      {
        __typename: 'FileStats',
        columnIndex: 0,
        columnName: 'Column #0',
        distinct: 256,
        isCategorical: true,
        count: 1281731,
        avg: '9706.470388',
        STD: '7451.165309',
        skewness: '0.637135',
        kurtosis: '2.329082',
        min: '0',
        max: '28565',
        sum: '12441083997',
        quantile25: '3318',
        quantile50: '7993',
        quantile75: '14948',
        type: 'Integer',
      },
    ],
  },
};

export const notProcessedFileIdMock = 'notProcessedFileId';
export const inProgressFileIdMock = 'inProgressFileId';
export const completedFileIdMock = 'completedFileId';
export const notFoundFileIdMock = 'notFoundFileId';
export const errorFileIdMock = 'errorFileId';

export const notProcessedFileStatsMock: getFileStats = {
  datasetInfo: {
    ...(fileStatsMock.datasetInfo as getFileStats_datasetInfo),
    hasStats: false,
    statsProgress: 0,
  },
};

export const inProgressFileStatsMock: getFileStats = {
  datasetInfo: {
    ...(fileStatsMock.datasetInfo as getFileStats_datasetInfo),
    hasStats: true,
    statsProgress: 50,
  },
};

export const completedFileStatsMock: getFileStats = {
  datasetInfo: {
    ...(fileStatsMock.datasetInfo as getFileStats_datasetInfo),
    hasStats: true,
    statsProgress: 100,
  },
};

export const notFoundFileStatsMock = [new GraphQLError('Not found!')];
