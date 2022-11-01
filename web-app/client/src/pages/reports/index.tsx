import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import _ from 'lodash';
import Loader from '@components/Loader/Loader';
import styles from '@styles/Reports.module.scss';

const ReportsHome: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {router.query.taskID && <Loader taskID={router.query.taskID as string} />}
      {!router.query.taskID && <p>You haven't selected a task</p>}
    </div>
  );
};

export default ReportsHome;
