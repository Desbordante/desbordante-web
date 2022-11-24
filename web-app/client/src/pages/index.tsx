import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import homeBackground from '@assets/images/backgrounds/home.jpg';
import Button from '../components/Button';
import ExternalLink from '../components/ExternalLink';
import styles from '../styles/Home.module.scss';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.root}>
      <div className={styles.background}>
        <Image
          src={homeBackground}
          alt="background"
          layout="fill"
          objectFit="cover"
        />
      </div>

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
