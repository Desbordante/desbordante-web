import _ from 'lodash';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Loader from '@components/Loader/Loader';
import styles from '@styles/Reports.module.scss';

const ReportsHome: NextPage = () => {
  const router = useRouter();
  const taskID = router.query.taskID;
  return (
    <div className={styles.container}>
      {taskID && (
        <Loader
          onComplete={() =>
            router.push({
              pathname: 'reports/dependencies',
              query: {
                taskID,
              },
            })
          }
          taskID={taskID as string}
        />
      )}
      {!taskID && <p>You haven't selected a task</p>}
    </div>
  );
};

export default ReportsHome;
