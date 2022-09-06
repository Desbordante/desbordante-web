import { FC, PropsWithChildren, useEffect, useState } from 'react';
import styles from './Loader.module.scss';
import logo from '@public/logo.svg';
import animatedLogo from '@public/logo.svg';
import serverError from '@assets/icons/server-error.svg';
import usersQueue from '@assets/icons/users-queue.svg';
import checkFill from '@assets/icons/check-fill.svg';
import resourcesLimit from '@assets/icons/resources-limit.svg';
import Image from 'next/image';
import { ApolloError, useQuery } from '@apollo/client';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { useRouter } from 'next/router';

type Props = {
  taskID: string;
};
type Status = {
  icon: any;
  label: string;
  className: string;
  description: string;
  isAnimated?: boolean;
};
const getStatusDetails = (
  error: ApolloError | undefined,
  taskInfo: getTaskInfo | undefined
) => {
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
const Loader: FC<Props> = ({ taskID }) => {
  const { data, error, startPolling } = useQuery<
    getTaskInfo,
    getTaskInfoVariables
  >(GET_TASK_INFO, { variables: { taskID } });

  const router = useRouter();
  const status = getStatusDetails(error, data);

  useEffect(() => {
    const state = data?.taskInfo.state;

    if (
      state?.__typename === 'TaskState' &&
      state.processStatus === 'COMPLETED'
    ) {
      setTimeout(
        () =>
          router.push({
            pathname: 'reports/charts',
            query: {
              taskID,
            },
          }),
        500
      );
    }
  }, [data?.taskInfo.state]);

  useEffect(() => {
    startPolling(2000);
  }, []);

  const icon = status.isAnimated ? (
    <video autoPlay muted loop width={70} height={76}>
      <source src={status.icon} type="video/mp4" />
    </video>
  ) : (
    <Image src={status.icon} alt="status" width={70} height={76} />
  );
  return (
    <div className={styles.container}>
      {icon}
      <div className={styles.text}>
        <p>
          Task status:
          <span className={styles[status.className]}> {status.label}</span>
        </p>
        <p className={styles.description}>{status.description}</p>
      </div>
    </div>
  );
};
export default Loader;
