import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Loader from '@components/Loader/Loader';
import styles from '@styles/Reports.module.scss';

const ReportsHome: NextPage = () => {
  const router = useRouter();
  const taskID = router.query.taskID as string;

  return <div className={styles.container}>{taskID && <Loader />}</div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.query.taskID) {
    return { notFound: true };
  }

  return { props: {} };
};

export default ReportsHome;
