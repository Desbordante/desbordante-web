import "./index.scss";
import React from "react";
import ReactDOM from "react-dom";
import {
 ApolloClient, InMemoryCache, ApolloProvider
} from "@apollo/client";
import App from "./App";
import { AuthContextProvider } from "./components/AuthContext";
import { TaskContextProvider } from "./components/TaskContext/TaskContext";
import { graphQLEndpoint } from "./APIFunctions";

const client = new ApolloClient({
    uri: graphQLEndpoint,
    cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <AuthContextProvider>
      <TaskContextProvider>
        <App />
      </TaskContextProvider>
    </AuthContextProvider>
  </ApolloProvider>,
  document.getElementById("root")
);
