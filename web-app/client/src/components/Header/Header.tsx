import Button from '@components/Button';
import { Icon } from '@components/IconComponent';
import LogInModal from '@components/LogInModal';
import NavBar from '@components/NavBar';
import SignUpModal from '@components/SignUpModal';
import { useAuthContext } from '@hooks/useAuthContext';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
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
            <p>Welcome, {user.name}</p>
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
                  setIsOpen={setIsOpenVerifyModal}
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
            <LogInModal
              isOpen={isOpenLogInModal}
              setIsOpen={setIsOpenLogInModal}
              onClose={() => setIsOpenLogInModal(false)}
            />

            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsOpenSignUpModal(true)}
            >
              Sign Up
            </Button>
            <SignUpModal
              isOpen={isOpenSignUpModal}
              setIsOpen={setIsOpenSignUpModal}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
