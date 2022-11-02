import { getTaskInfo } from '@graphql/operations/queries/__generated__/getTaskInfo';
import { PrimitiveType, TaskProcessStatusType } from 'types/globalTypes';

export const inProgressTaskIdMock = 'inProgressTaskId';
export const inProgressTaskInfoMock: getTaskInfo = {
  taskInfo: {
    __typename: 'TaskInfo',
    state: {
      __typename: 'TaskState',
      processStatus: TaskProcessStatusType.IN_PROCESS,
      isPrivate: true,
      attemptNumber: 1,
      phaseName: 'name',
      currentPhase: 1,
      progress: 0.5,
      maxPhase: 4,
      isExecuted: false,
      elapsedTime: null,
    },
    data: {
      __typename: 'TaskWithDepsData',
      baseConfig: {
        __typename: 'BaseTaskConfig',
        algorithmName: 'algoName',
        type: PrimitiveType.FD,
      },
      specificConfig: {
        __typename: 'FDTaskConfig',
        errorThreshold: 0.4,
        maxLHS: 5,
        threadsCount: 4,
      },
    },
  },
};

export const completedTaskIdMock = 'completedTaskId';
export const completedTaskInfoMock: getTaskInfo = {
  taskInfo: {
    __typename: 'TaskInfo',
    state: {
      __typename: 'TaskState',
      processStatus: TaskProcessStatusType.COMPLETED,
      isPrivate: true,
      attemptNumber: 1,
      phaseName: 'name',
      currentPhase: 1,
      progress: 0.5,
      maxPhase: 4,
      isExecuted: false,
      elapsedTime: null,
    },
    data: {
      __typename: 'TaskWithDepsData',
      baseConfig: {
        __typename: 'BaseTaskConfig',
        algorithmName: 'algoName',
        type: PrimitiveType.FD,
      },
      specificConfig: {
        __typename: 'FDTaskConfig',
        errorThreshold: 0.4,
        maxLHS: 5,
        threadsCount: 4,
      },
    },
  },
};
