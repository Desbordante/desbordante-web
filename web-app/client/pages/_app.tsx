import { ApolloProvider } from '@apollo/client';
import Layout from '@components/Layout';
import GoogleAnalytics from '@components/GoogleAnalytics';
import { environment } from '@utils/env';
import client from '@graphql/client';
import ClientOnly from '@components/ClientOnly';
import { AuthContextProvider } from '@components/AuthContext';
import { ErrorContextProvider } from '@components/ErrorContext';
import '@styles/globals.scss';
import { AppPropsWithLayout } from 'types/pageWithLayout';

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
