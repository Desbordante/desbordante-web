import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

import { serverProxyURL } from '@constants/endpoints';
import { errorLink, requestIdLink } from '@graphql/context';
import { customFetch } from '@graphql/customFetch';
import { pathnameToLocalURL } from '@utils/pathnameToValidURL';

const isServer = typeof window === 'undefined';
console.log(serverProxyURL)
const client = new ApolloClient({
  ssrMode: isServer,
  uri: isServer ? pathnameToLocalURL(serverProxyURL) : serverProxyURL,
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    //@ts-ignore
    errorLink,
    requestIdLink,
    createUploadLink({
      uri: isServer ? pathnameToLocalURL(serverProxyURL) : serverProxyURL,
      fetch: customFetch as any,
    }),
  ]),
});

export default client;
