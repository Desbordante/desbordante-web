import type { AppProps } from 'next/app';
import Layout from '@components/Layout';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { environment } from '@utils/env';
import '@styles/globals.scss';
import { ApolloProvider } from "@apollo/client";
import client from "../graphql/client";
import ClientOnly from '@components/ClientOnly';
import { AuthContextProvider } from '@components/AuthContext';
import { ErrorContextProvider } from '@components/ErrorContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ClientOnly>
        <ErrorContextProvider>
          <AuthContextProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
          </AuthContextProvider>
        </ErrorContextProvider>
      </ClientOnly>

      {environment === 'production' && <GoogleAnalytics />}
    </ApolloProvider>
  );
}

export default MyApp;
