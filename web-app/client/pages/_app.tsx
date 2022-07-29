import type { AppProps } from 'next/app';
import Layout from '@components/Layout';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { environment } from '@utils/env';
import '@styles/globals.scss';
import { ApolloProvider } from "@apollo/client";
import client from "../graphql/client";
import ClientOnly from '@components/ClientOnly';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ClientOnly>
        <Layout>
            <Component {...pageProps} />
        </Layout>
      </ClientOnly>

      {environment === 'production' && <GoogleAnalytics />}
    </ApolloProvider>
  );
}

export default MyApp;
