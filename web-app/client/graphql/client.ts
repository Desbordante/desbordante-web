import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

import { graphQLEndpoint, graphQLLocalEndpoint } from '@constants/endpoints';
import { errorLink, requestIdLink } from '@graphql/context';
import { customFetch } from '@graphql/customFetch';

const isServer = typeof window === 'undefined';
// @ts-ignore
const windowApolloState = !isServer && window.__NEXT_DATA__.apolloState;

const client = new ApolloClient({
  ssrMode: isServer,
  uri: isServer ? graphQLLocalEndpoint : graphQLEndpoint,
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    //@ts-ignore
    errorLink,
    requestIdLink,
    createUploadLink({
      uri: graphQLEndpoint,
      fetch: customFetch as any,
    }),
  ]),
});

export default client;
