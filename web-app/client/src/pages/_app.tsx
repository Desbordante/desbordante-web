import { ApolloProvider } from '@apollo/client';
import Layout from '@components/common/layout/Layout';
import { ToastContainer } from '@components/common/uikit/Toast';
import { AuthContextProvider } from '@components/meta/AuthContext';
import { ErrorContextProvider } from '@components/meta/ErrorContext';
import client from '@graphql/client';
import '@styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';
import { AppPropsWithLayout } from 'types/pageWithLayout';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ApolloProvider client={client}>
      <ErrorContextProvider>
        <AuthContextProvider>
          <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
          <ToastContainer />
        </AuthContextProvider>
      </ErrorContextProvider>
    </ApolloProvider>
  );
}

export default MyApp;
