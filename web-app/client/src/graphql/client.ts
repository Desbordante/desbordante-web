import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

import { graphQLEndpoint, graphQLLocalEndpoint } from '@constants/endpoints';
import { errorLink, requestIdLink } from '@graphql/context';
import { customFetch } from '@graphql/customFetch';

const isServer = typeof window === 'undefined';
const uri = isServer ? graphQLLocalEndpoint : graphQLEndpoint;

const client = new ApolloClient({
  ssrMode: isServer,
  uri,
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    //@ts-ignore
    errorLink,
    requestIdLink,
    createUploadLink({
      uri,
      fetch: customFetch as any,
    }),
  ]),
});

export default client;
