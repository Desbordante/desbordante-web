import { ApolloProvider } from '@apollo/client';
import { AuthContextProvider } from '@components/AuthContext';
import ClientOnly from '@components/ClientOnly';
import { ErrorContextProvider } from '@components/ErrorContext';
import GoogleAnalytics from '@components/GoogleAnalytics';
import Layout from '@components/Layout';
import { ToastContainer } from '@components/Toast';
import client from '@graphql/client';
import { environment } from '@utils/env';
import '@styles/globals.scss';
import { AppPropsWithLayout } from 'types/pageWithLayout';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ApolloProvider client={client}>
      <ClientOnly>
        <ErrorContextProvider>
          <AuthContextProvider>
            <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
            <ToastContainer />
          </AuthContextProvider>
        </ErrorContextProvider>
      </ClientOnly>
      {environment === 'production' && <GoogleAnalytics />}
    </ApolloProvider>
  );
}

export default MyApp;
