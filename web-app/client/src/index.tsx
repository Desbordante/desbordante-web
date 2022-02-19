import "./index.scss";
import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

import App from "./App";
import { AuthContextProvider } from "./components/AuthContext";
import { TaskContextProvider } from "./components/TaskContext/TaskContext";
import { ErrorContextProvider } from "./components/ErrorContext";
import { graphQLEndpoint } from "./APIFunctions";
import { AlgorithmConfigContextProvider } from "./components/AlgorithmConfigContext";
import { customFetch } from "./customFetch";
import { requestIdLink } from "./components/context";

const client = new ApolloClient({
  uri: graphQLEndpoint,
  cache: new InMemoryCache(),
  link: requestIdLink.concat(
    createUploadLink({
      uri: graphQLEndpoint,
      fetch: customFetch as any,
    })
  ),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ErrorContextProvider>
      <AuthContextProvider>
        <TaskContextProvider>
          <AlgorithmConfigContextProvider>
            <App />
          </AlgorithmConfigContextProvider>
        </TaskContextProvider>
      </AuthContextProvider>
    </ErrorContextProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
