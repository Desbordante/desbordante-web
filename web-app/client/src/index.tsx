import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
} from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

import "./index.scss";
import App from "./App";
import { AuthContextProvider } from "./components/AuthContext";
import { ErrorContextProvider } from "./components/ErrorContext";
import { graphQLEndpoint } from "./APIFunctions";
import { customFetch } from "./graphql/customFetch";
import { errorLink, requestIdLink } from "./graphql/context";

const client = new ApolloClient({
  uri: graphQLEndpoint,
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    // @ts-ignore
    errorLink,
    requestIdLink,
    createUploadLink({
      uri: graphQLEndpoint,
      fetch: customFetch as any,
    }),
  ]),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ErrorContextProvider>
      <AuthContextProvider>
              <App />
      </AuthContextProvider>
    </ErrorContextProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
