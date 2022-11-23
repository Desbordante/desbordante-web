import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@components/Button';
import { useAuthContext } from '@hooks/useAuthContext';
import useModal from '@hooks/useModal';
import logo from '@public/logo.svg';
import styles from './Header.module.scss';

const Header = () => {
  const { user, signOut } = useAuthContext();
  const { open: openLogInModal } = useModal('AUTH.LOG_IN');
  const { open: openSignUpModal } = useModal('AUTH.SIGN_UP');

  const [headerBackground, setHeaderBackground] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setHeaderBackground(window.pageYOffset > 100);
    };

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
            <Button variant="secondary-danger" size="sm" onClick={signOut}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openLogInModal({})}
            >
              Log In
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => openSignUpModal({})}
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
