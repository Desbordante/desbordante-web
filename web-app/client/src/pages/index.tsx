import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import HomeBackground from '@assets/backgrounds/home.svg?component';
import Button from '../components/Button';
import ExternalLink from '../components/ExternalLink';
import styles from '../styles/Home.module.scss';

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={styles.root}>
      <HomeBackground
        className={styles.background}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      />

      <div className={styles.hero}>
        <div className={styles.content}>
          <h1 className={styles.name}>Desbordante</h1>
          <h6 className={styles.description}>
            Open-source data profiling tool
          </h6>
          <div className={styles.links}>
            <Button
              variant="gradient"
              onClick={() => router.push('/create-task/choose-file')}
            >
              Get Started
            </Button>

            <ExternalLink href="https://github.com/Mstrutov/Desbordante">
              GitHub
            </ExternalLink>
            <ExternalLink href="https://mstrutov.github.io/Desbordante">
              User Guide
            </ExternalLink>
          </div>
        </div>
        <div className={styles.videoContainer}>
          <video autoPlay muted loop>
            <source src="/hero-animation.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </div>
  );
};

export default Home;
