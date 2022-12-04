import { GraphQLError } from 'graphql';
import { getFileStats } from '@graphql/operations/queries/__generated__/getFileStats';
import { MainPrimitiveType, TaskErrorStatusType } from 'types/globalTypes';

const fileStatsMock: getFileStats = {
  algorithmsConfig: {
    __typename: 'AlgorithmsConfig',
    maxThreadsCount: 8,
  },

  datasetInfo: {
    __typename: 'DatasetInfo',
    fileID: 'f7410bff-873a-4299-82dc-fc1f21b44cd1',
    fileName: 'SimpleTypos.csv',
    originalFileName: 'SimpleTypos.csv',
    countOfColumns: 3,
    supportedPrimitives: [MainPrimitiveType.Stats],
    statsInfo: {
      __typename: 'DatasetStats',
      overview: [{ __typename: 'OverviewData', name: 'Test', amount: 10 }],
      state: null,
      stats: [],
    },
  },
};

export const notProcessedFileIdMock = 'notProcessedFileId';
export const inProgressFileIdMock = 'inProgressFileId';
export const completedFileIdMock = 'completedFileId';
export const notFoundFileIdMock = 'notFoundFileId';
export const errorFileIdMock = 'errorFileId';
export const startErrorFileIdMock = 'startErrorFileId';
export const statsErrorFileIdMock = 'statsErrorFileId';
export const notSupportedFileIdMock = 'notSupportedFileId';

export const notProcessedFileStatsMock: getFileStats = fileStatsMock;

export const inProgressFileStatsMock: getFileStats = {
  ...fileStatsMock,

  datasetInfo: {
    ...fileStatsMock.datasetInfo,
    statsInfo: {
      ...fileStatsMock.datasetInfo.statsInfo,
      state: {
        __typename: 'TaskState',
        progress: 50,
      },
    },
  },
};

export const completedFileStatsMock: getFileStats = {
  ...fileStatsMock,

  datasetInfo: {
    ...fileStatsMock.datasetInfo,
    statsInfo: {
      ...fileStatsMock.datasetInfo.statsInfo,
      state: {
        __typename: 'TaskState',
        progress: 100,
      },
      stats: [
        {
          __typename: 'ColumnStats',
          column: {
            __typename: 'Column',
            index: 0,
            name: 'Column #0',
          },
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
  },
};

export const notFoundFileStatsMock = [new GraphQLError('Not found!')];
export const startErrorFileStatsMock = [new GraphQLError('Start error!')];

export const statsErrorFileStatsMock: getFileStats = {
  ...fileStatsMock,

  datasetInfo: {
    ...fileStatsMock.datasetInfo,
    statsInfo: {
      ...fileStatsMock.datasetInfo.statsInfo,
      state: {
        __typename: 'InternalServerTaskError',
        errorStatus: TaskErrorStatusType.INTERNAL_SERVER_ERROR,
      },
      stats: [],
    },
  },
};

export const notSupportedFileStatsMock: getFileStats = {
  ...fileStatsMock,

  datasetInfo: {
    ...fileStatsMock.datasetInfo,
    supportedPrimitives: [],
  },
};
