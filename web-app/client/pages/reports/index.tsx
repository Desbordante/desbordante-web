import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import _ from 'lodash';
import Loader from '@components/Loader/Loader';
import styles from '@styles/Reports.module.scss';

const ReportsHome: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Loader status="error" />
    </div>
  );
};

export default ReportsHome;
