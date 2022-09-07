import serverError from '@assets/icons/server-error.svg';
import usersQueue from '@assets/icons/users-queue.svg';
import checkFill from '@assets/icons/check-fill.svg';
import resourcesLimit from '@assets/icons/resources-limit.svg';
import { ApolloError } from '@apollo/client';
import { getTaskInfo } from '@graphql/operations/queries/__generated__/getTaskInfo';

type Status = {
  icon: any;
  label: string;
  className: string;
  description: string;
  isAnimated?: boolean;
};

const getStatusDetails: (
  error: ApolloError | undefined,
  taskInfo: getTaskInfo | undefined
) => Status = (error, taskInfo) => {
  const state = taskInfo?.taskInfo.state;

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
        icon: '/animated_logo.webm',
        isAnimated: true,
        label: 'In Progress',
        className: 'progress',
        description: `Adding task to the database`,
      };
    }
    if (state.processStatus === 'IN_PROCESS') {
      return {
        icon: '/animated_logo.webm',
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
    icon: '/animated_logo.webm',
    isAnimated: true,
    label: 'In Progress',
    className: 'progress',
    description: '',
  };
};

export default getStatusDetails;
