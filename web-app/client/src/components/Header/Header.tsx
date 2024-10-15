import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@components/Button';
import Icon from '@components/Icon';
import LogInModal from '@components/LogInModal';
import NavBar from '@components/NavBar';
import SignUpModal from '@components/SignUpModal';
import { useAuthContext } from '@hooks/useAuthContext';
import styles from './Header.module.scss';

const Header = () => {
  const { user, signOut } = useAuthContext();

  const [headerBackground, setHeaderBackground] = useState(false);
  const [isOpenSignUpModal, setIsOpenSignUpModal] = useState(false);
  const [isOpenLogInModal, setIsOpenLogInModal] = useState(false);
  const [isOpenVerifyModal, setIsOpenVerifyModal] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setHeaderBackground(window.scrollY > 64);
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
        headerBackground && styles.background,
      )}
    >
      <NavBar />
      <Button
        variant="secondary"
        size="sm"
        aria-label="open menu"
        icon={<Icon name="list" />}
        className={styles.menu}
      />
      <div className={styles.auth}>
        {user?.name ? (
          <>
            <p>
              Welcome,{' '}
              <Link className={styles.userCabinetLink} href="/me">
                {user.name}
              </Link>
            </p>
            {!user.isVerified && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOpenVerifyModal(true)}
                >
                  Verify Email
                </Button>
                <SignUpModal
                  isOpen={isOpenVerifyModal}
                  onClose={() => setIsOpenVerifyModal(false)}
                />
              </>
            )}
            <Button variant="secondary-danger" size="sm" onClick={signOut}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsOpenLogInModal(true)}
            >
              Log In
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsOpenSignUpModal(true)}
            >
              Sign Up
            </Button>
          </>
        )}
        <LogInModal
          isOpen={isOpenLogInModal}
          onClose={() => setIsOpenLogInModal(false)}
        />
        <SignUpModal
          isOpen={isOpenSignUpModal}
          onClose={() => setIsOpenSignUpModal(false)}
        />
      </div>
    </header>
  );
};

export default Header;
