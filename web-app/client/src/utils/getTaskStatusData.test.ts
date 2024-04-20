import { ApolloError } from '@apollo/client';
import getTaskStatusData from '@utils/getTaskStatusData';

describe('getTaskStatusData Utility Function', () => {
  it('Should return correct data for queued task', () => {
    expect(getTaskStatusData(undefined, undefined)).toMatchObject({
      description: expect.stringMatching(/waiting to be executed/i),
      label: expect.stringMatching(/queued/i),
    });
  });

  it('Should return correct data for internal error', () => {
    expect(
      getTaskStatusData(
        new ApolloError({
          errorMessage: 'error',
        }),
        undefined,
      ),
    ).toMatchObject({
      description: expect.stringMatching(/something went wrong/i),
      label: expect.stringMatching(/server error/i),
    });
    expect(
      getTaskStatusData(undefined, {
        taskInfo: {
          state: {
            __typename: 'InternalServerTaskError',
          },
        },
      }),
    ).toMatchObject({
      description: expect.stringMatching(/something went wrong/i),
      label: expect.stringMatching(/server error/i),
    });
  });

  it('Should return correct data for resource limit error', () => {
    expect(
      getTaskStatusData(undefined, {
        taskInfo: {
          state: {
            __typename: 'ResourceLimitTaskError',
          },
        },
      }),
    ).toMatchObject({
      description: expect.stringMatching(/ran out of resources/i),
      label: expect.stringMatching(/resource Limit/i),
    });
  });

  it('Should return correct data for completed task', () => {
    expect(
      getTaskStatusData(undefined, {
        taskInfo: {
          state: {
            __typename: 'TaskState',
            processStatus: 'COMPLETED',
          },
        },
      }),
    ).toMatchObject({
      description: expect.stringMatching(/you will see the results/i),
      label: expect.stringMatching(/completed/i),
    });
  });

  it('Should return correct data for added to DB task', () => {
    expect(
      getTaskStatusData(undefined, {
        taskInfo: {
          state: {
            __typename: 'TaskState',
            processStatus: 'ADDING_TO_DB',
          },
        },
      }),
    ).toMatchObject({
      description: expect.stringMatching(/adding task to the database/i),
      label: expect.stringMatching(/in progress/i),
    });
  });

  it('Should return correct data for task in progress', () => {
    expect(
      getTaskStatusData(undefined, {
        taskInfo: {
          state: {
            __typename: 'TaskState',
            processStatus: 'IN_PROCESS',
            currentPhase: 1,
            maxPhase: 2,
            phaseName: 'doing smth',
          },
        },
      }),
    ).toMatchObject({
      description: expect.stringMatching(/step 1 of 2: doing smth/i),
      label: expect.stringMatching(/in progress/i),
    });
  });

  it('Should return correct data for task in unknown state', () => {
    expect(
      getTaskStatusData(undefined, {
        taskInfo: {
          state: {
            __typename: '',
          },
        },
      }),
    ).toMatchObject({
      description: '',
      label: expect.stringMatching(/in progress/i),
    });
  });
});
