import Head from 'next/head';

import Header from '@components/Header';
import { FCWithChildren } from 'types/react';
import styles from './Layout.module.scss';
import { useContext } from 'react';
import { AuthContext } from '@components/AuthContext';
import SignUpForm from '@components/SignUpForm';

const Layout: FCWithChildren = ({ children }) => {

  const { isSignUpShown, isFeedbackShown, isLogInShown } =
    useContext(AuthContext)!;

  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" />
      </Head>
      <Header />
      {isSignUpShown && <SignUpForm />}
      <main className={styles.content}>{children}</main>
    </>
  );
};

export default Layout;
