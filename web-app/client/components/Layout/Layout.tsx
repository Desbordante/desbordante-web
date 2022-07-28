import Head from 'next/head';

import Header from '@components/Header';
import { FCWithChildren } from 'types/react';
import styles from './Layout.module.scss';

const Layout: FCWithChildren = ({ children }) => {
  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main className={styles.content}>{children}</main>
    </>
  );
};

export default Layout;
