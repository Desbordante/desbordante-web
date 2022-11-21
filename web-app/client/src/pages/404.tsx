import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Button from '@components/Button';
import Background from '@public/404.svg?component';
import styles from '@styles/404.module.scss';

const _404: NextPage = () => {
  const { push } = useRouter();

  return (
    <div className={styles.wrapper}>
      <Background
        className={styles.background}
        preserveAspectRatio="xMidYMid slice"
      />
      <div className={styles.inner}>
        <h1>404</h1>
        <h5>Page not found</h5>
        <p>The page you are trying to locate does not exist</p>
      </div>
      <Button variant="secondary" onClick={() => push('/')}>
        Go to Home Page
      </Button>
    </div>
  );
};

export default _404;
