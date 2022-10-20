import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import Layout from '@components/Layout';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { environment } from '@utils/env';
import client from '@graphql/client';
import { NextPage } from 'next';
import ClientOnly from '@components/ClientOnly';
import { AuthContextProvider } from '@components/AuthContext';
import { ErrorContextProvider } from '@components/ErrorContext';
import { ReactElement, ReactNode } from 'react';
import '@styles/globals.scss';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ApolloProvider client={client}>
      <ClientOnly>
        <ErrorContextProvider>
          <AuthContextProvider>
            <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
          </AuthContextProvider>
        </ErrorContextProvider>
      </ClientOnly>

      {environment === 'production' && <GoogleAnalytics />}
    </ApolloProvider>
  );
}

export default MyApp;
