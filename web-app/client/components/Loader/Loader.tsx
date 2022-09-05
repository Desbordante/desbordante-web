import { FC, PropsWithChildren, useEffect, useState } from 'react';
import styles from './Loader.module.scss';
import logo from '@public/logo.svg';
import serverError from '@assets/icons/server-error.svg';
import usersQueue from '@assets/icons/users-queue.svg';
import checkFill from '@assets/icons/check-fill.svg';
import resourcesLimit from '@assets/icons/resources-limit.svg';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
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
};

const Loader: FC<Props> = ({ taskID }) => {
  const { loading, data, error } = useQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO,
    { variables: { taskID } }
  );

  const router = useRouter();
  const [status, setStatus] = useState<Status>();
  const [tries, setTries] = useState(1);
  const state = data?.taskInfo.state;

  useEffect(() => {
    if (!state) return;
    if (state.__typename === 'TaskState') {
      if (state.processStatus === 'ADDED_TO_THE_TASK_QUEUE') {
        setStatus({
          icon: usersQueue,
          label: 'Queued',
          className: 'queued',
          description: 'Task is waiting to be executed',
        });
      }
      if (state.processStatus === 'COMPLETED') {
        setStatus({
          icon: checkFill,
          label: 'Completed',
          className: 'completed',
          description: 'You will see the results in a moment',
        });
      }
      if (state.processStatus === 'IN_PROCESS') {
        setStatus({
          icon: logo,
          label: 'In Progress',
          className: 'progress',
          description: `Step ${state.currentPhase} of ${state.maxPhase}: ${state.phaseName}`,
        });
      }
    }
    if (state.__typename === 'InternalServerTaskError') {
      setStatus({
        icon: serverError,
        label: 'Internal Server Error',
        className: 'error',
        description: 'Something went wrong with our server',
      });
    }
    if (state.__typename === 'ResourceLimitTaskError') {
      setStatus({
        label: 'Resource Limit Reached',
        icon: resourcesLimit,
        className: 'resources-limit',
        description:
          'Our server ran out of resources while executing your task',
      });
    }
  }, [data?.taskInfo.state]);

  useEffect(() => {
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
    } else {
      setTimeout(() => setTries((i) => ++i), 2000);
    }
  }, [tries]);

  if (!status) return <></>;
  return (
    <div className={styles.container}>
      <Image src={status.icon} alt="status" width={70} height={76} />
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
