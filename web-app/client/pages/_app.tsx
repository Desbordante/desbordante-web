import type { AppProps } from 'next/app';
import Layout from '@components/Layout';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { environment } from '@utils/env';
import '@styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      {environment === 'production' && <GoogleAnalytics />}
    </>
  );
}

export default MyApp;
