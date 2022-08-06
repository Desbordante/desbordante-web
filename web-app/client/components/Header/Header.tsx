import { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@components/Button';
import { AuthContext } from '@components/AuthContext';
import styles from './Header.module.scss';
import logo from '@public/logo.svg';

const Header = () => {
  const {user, setIsSignUpShown, setIsLogInShown, signOut} = useContext(AuthContext)!
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
        {user?.name ? (<>
          <p>Welcome, {user.name}</p>
          <Button variant="tertiary" size="sm" onClick={signOut}>
            Log Out
          </Button>
        </>) : (<>
          <Button variant="tertiary" size="sm" onClick={() => setIsLogInShown(true)}>
            Log In
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setIsSignUpShown(true)}>
            Sign Up
          </Button>
        </>)}
      </div>
    </header>
  );
};

export default Header;