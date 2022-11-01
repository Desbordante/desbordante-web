import { FC, useEffect } from 'react';
import styles from './Loader.module.scss';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { useRouter } from 'next/router';
import cn from 'classnames';
import getStatusDetails from './StatusDetails';

type Props = {
  taskID: string;
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
      state &&
      'processStatus' in state &&
      state.processStatus === 'COMPLETED'
    ) {
      setTimeout(
        () =>
          router.push({
            pathname: 'reports/dependencies',
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
      <source src={status.icon} type="video/webm" />
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
          <span className={cn(styles[status.className], styles.status)}>
            {' '}
            {status.label}
          </span>
        </p>
        <p className={styles.description}>{status.description}</p>
      </div>
    </div>
  );
};
export default Loader;
