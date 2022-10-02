import { useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';
import Button from '@components/Button';
import { useBrowserEffect } from 'hooks/useBrowserEffect';
import { AuthContext } from '@components/AuthContext';
import styles from './Header.module.scss';
import logo from '@public/logo.svg';

const Header = () => {
  const { user, setIsSignUpShown, setIsLogInShown, signOut } =
    useContext(AuthContext)!;

  const [headerBackground, setHeaderBackground] = useState(false);

  const checkScroll = useCallback(() => {
    setHeaderBackground(window.pageYOffset > 100);
  }, []);

  useBrowserEffect(() => {
    window.addEventListener('scroll', checkScroll);
    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  return (
    <header
      className={classNames(
        styles.header,
        headerBackground && styles.background
      )}
    >
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
        {user?.name ? (
          <>
            <p>Welcome, {user.name}</p>
            <Button variant="tertiary" size="sm" onClick={signOut}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setIsLogInShown(true)}
            >
              Log In
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsSignUpShown(true)}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
