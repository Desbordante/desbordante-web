import Head from 'next/head';
import { useContext } from 'react';
import { AuthContext } from '@components/AuthContext';
import { ErrorContext } from '@components/ErrorContext';
import Header from '@components/Header';
import LogInForm from '@components/LogInForm/LogInForm';
import SignUpForm from '@components/SignUpForm';
import { FCWithChildren } from 'types/react';
import styles from './Layout.module.scss';

const Layout: FCWithChildren = ({ children }) => {
  const { isSignUpShown, isFeedbackShown, isLogInShown } =
    useContext(AuthContext)!;
  const { error, isErrorShown, hideError } = useContext(ErrorContext)!;
  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      {isErrorShown && (
        <div className={styles.error}>
          <p onClick={hideError}>{error?.message}</p>
        </div>
      )}

      {isSignUpShown && <SignUpForm />}
      {isLogInShown && <LogInForm />}
      <main className={styles.content}>{children}</main>
    </>
  );
};

export default Layout;
