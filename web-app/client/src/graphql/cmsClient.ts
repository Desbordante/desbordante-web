import { ApolloClient, InMemoryCache } from '@apollo/client';
import { cmsProxyURL } from '@constants/endpoints';

import { cmsApiToken } from '@utils/env';
import { pathnameToLocalURL } from '@utils/pathnameToValidURL';

const isServer = typeof window === 'undefined';

const cmsClient = new ApolloClient({
  ssrMode: isServer,
  uri: isServer ? pathnameToLocalURL(cmsProxyURL) : cmsProxyURL,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: typeof window === 'undefined' ? 'no-cache' : 'cache-first',
      errorPolicy: 'all',
    },
  },
  headers: {
    Authorization: `bearer ${cmsApiToken}`,
  },
});

export default cmsClient;
