const MobileBanner = dynamic(() => import('@components/MobileBanner'), {
  ssr: false,
});

import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import visibleModalsAtom from '@atoms/visibleModalsAtom';
import Header from '@components/Header';
import { FCWithChildren } from 'types/react';
import styles from './Layout.module.scss';

const Layout: FCWithChildren = ({ children }) => {
  const [visibleModals] = useAtom(visibleModalsAtom);

  return (
    <>
      <Head>
        <title>Desbordante | Open-source Data Profiling Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      {visibleModals.map((modal) => modal.node)}
      <main className={styles.content}>{children}</main>
      <MobileBanner />
    </>
  );
};

export default Layout;
