import { FC, PropsWithChildren } from 'react';
import styles from './Loader.module.scss';
import logo from '@public/logo.svg';
import serverError from '@assets/icons/server-error.svg';
import usersQueue from '@assets/icons/users-queue.svg';
import checkFill from '@assets/icons/check-fill.svg';
import resourcesLimit from '@assets/icons/resources-limit.svg';
import Image from 'next/image';

type Props = {
  status: 'queued' | 'progress' | 'completed' | 'error' | 'resources-limit';
};

const Loader: FC<Props> = ({ status }) => {
  const options = {
    queued: {
      icon: usersQueue,
      label: 'Queued',
      description: 'Task is waiting to be executed',
    },
    progress: {
      icon: logo,
      label: 'In Progress',
      description: 'Step 3 of 5: doing something',
    },
    completed: {
      icon: checkFill,
      label: 'Completed',
      description: 'You will see the results in a moment',
    },
    error: {
      icon: serverError,
      label: 'Internal Server Error',
      description: 'Something went wrong with our server',
    },
    'resources-limit': {
      label: 'Resource Limit Reached',
      icon: resourcesLimit,
      description: 'Our server ran out of resources while executing your task',
    },
  };
  return (
    <div className={styles.container}>
      <Image src={options[status].icon} alt="status" width={70} height={76} />
      <div className={styles.text}>
        <p>
          Task status:
          <span className={styles[status]}> {options[status].label}</span>
        </p>
        <p className={styles.description}>{options[status].description}</p>
      </div>
    </div>
  );
};
export default Loader;
