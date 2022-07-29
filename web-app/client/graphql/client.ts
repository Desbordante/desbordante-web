import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

import { graphQLEndpoint } from '@constants/endpoints';
import { errorLink, requestIdLink } from '@graphql/context';
import { customFetch } from '@graphql/customFetch';

const client = new ApolloClient({
  uri: graphQLEndpoint,
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
