import { ApolloError } from '@apollo/client';
import checkFill from '@assets/icons/check-fill.svg';
import resourcesLimit from '@assets/icons/resources-limit.svg';
import serverError from '@assets/icons/server-error.svg';
import usersQueue from '@assets/icons/users-queue.svg';
import { TaskState } from '@atoms/primaryAtoms/taskStateAtom';

const getTaskStatusData = (
  error: ApolloError | undefined,
  state: TaskState | undefined,
) => {
  if (error) {
    return {
      icon: serverError,
      label: 'Internal Server Error',
      className: 'error',
      description: 'Something went wrong with our server',
    };
  }
  if (!state) {
    return {
      icon: usersQueue,
      label: 'Queued',
      className: 'queued',
      description: 'Task is waiting to be executed',
    };
  }
  if (state.__typename === 'TaskState') {
    if (state.processStatus === 'COMPLETED') {
      return {
        icon: checkFill,
        label: 'Completed',
        className: 'completed',
        description: 'You will see the results in a moment',
      };
    }

    if (state.processStatus === 'ADDING_TO_DB') {
      return {
        icon: '/logo-animation.webm',
        isAnimated: true,
        label: 'In Progress',
        className: 'progress',
        description: `Adding task to the database`,
      };
    }
    if (state.processStatus === 'IN_PROCESS') {
      return {
        icon: '/logo-animation.webm',
        isAnimated: true,
        label: 'In Progress',
        className: 'progress',
        description: `Step ${state.currentPhase} of ${state.maxPhase}: ${state.phaseName}`,
      };
    }
  }
  if (state.__typename === 'InternalServerTaskError') {
    return {
      icon: serverError,
      label: 'Internal Server Error',
      className: 'error',
      description: 'Something went wrong with our server',
    };
  }
  if (state.__typename === 'ResourceLimitTaskError') {
    return {
      label: 'Resource Limit Reached',
      icon: resourcesLimit,
      className: 'resources-limit',
      description: 'Our server ran out of resources while executing your task',
    };
  }

  return {
    icon: '/logo-animation.webm',
    isAnimated: true,
    label: 'In Progress',
    className: 'progress',
    description: '',
  };
};

export default getTaskStatusData;
