import visibleModalsAtom from '@atoms/visibleModalsAtom';
import Header from '@components/Header';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { FCWithChildren } from 'types/react';
import styles from './Layout.module.scss';

const MobileBanner = dynamic(() => import('@components/MobileBanner'), {
  ssr: false,
});

const Layout: FCWithChildren = ({ children }) => {
  const [visibleModals] = useAtom(visibleModalsAtom);

  return (
    <>
      <NextSeo
        titleTemplate="Desbordante | %s"
        defaultTitle="Desbordante | Open-source data profiling tool"
        description="Open-source data profiling tool"
        themeColor="#000000"
        canonical="https://desbordante.unidata-platform.ru/"
        openGraph={{
          type: 'website',
          url: 'https://desbordante.unidata-platform.ru/',
          siteName: 'Desbordante',
          locale: 'en_US',
          images: [
            {
              url: 'https://desbordante.unidata-platform.ru/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'Desbordante Logo',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      <Header />
      {visibleModals.map((modal) => modal.node)}
      <main className={styles.content}>{children}</main>
      <MobileBanner />
    </>
  );
};

export default Layout;
