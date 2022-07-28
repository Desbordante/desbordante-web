import Link from 'next/link';
import Image from 'next/image';
import Button from '@components/Button';
import styles from './Header.module.scss';

import logo from '@public/logo.svg';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/">
        <div className={styles.brand}>
          <Image
            src={logo}
            alt="Logo"
            className={styles.logo}
            width={32.84}
            height={36.74}
          />
          <h6 className={styles.brandName}>Desbordante</h6>
        </div>
      </Link>
      <div className={styles.auth}>
        <Button variant="tertiary" size="sm">
          Log In
        </Button>
        <Button variant="gradient" size="sm">
          Sign Up
        </Button>
      </div>
    </header>
  );
};

export default Header;
