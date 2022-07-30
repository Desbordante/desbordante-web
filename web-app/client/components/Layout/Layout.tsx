import { useContext } from 'react';
import { FCWithChildren } from 'types/react';
import Head from 'next/head';
import { AuthContext } from '@components/AuthContext';
import SignUpForm from '@components/SignUpForm';
import Header from '@components/Header';
import styles from './Layout.module.scss';

const Layout: FCWithChildren = ({ children }) => {
  const { isSignUpShown, isFeedbackShown, isLogInShown } = useContext(AuthContext)!;
  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      {isSignUpShown && <SignUpForm />}
      <main className={styles.content}>{children}</main>
    </>
  );
};

export default Layout;