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
  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      {isSignUpShown && <SignUpForm />}
      {isLogInShown && <LogInForm />}
      <main className={styles.content}>{children}</main>
    </>
  );
};

export default Layout;
