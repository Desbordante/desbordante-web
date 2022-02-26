/* eslint-disable consistent-return */
/* eslint-disable default-case */
/* eslint-disable arrow-body-style */

import { onError } from "apollo-link-error";
import { fromPromise } from "apollo-link";
import { setContext } from "@apollo/client/link/context";
import { v4 as uuidv4 } from "uuid";
import { graphQLEndpoint } from "../APIFunctions";
import {
  getAccessToken,
  getRefreshToken,
  removeTokenPair,
  removeUser,
  saveTokenPair,
  setAccessToken,
} from "../functions/authTokens";
import { TokenPair } from "../types/types";

export function generateRequestHeaders() {
  const deviceID = localStorage.getItem("deviceID") || "";
  const deviceInfo = localStorage.getItem("deviceInfo") || "";
  const userID = localStorage.getItem("userID") || "";
  const randomID = uuidv4();

  const requestId = `${deviceID}:${userID}:${randomID}`;

  return {
    "X-Request-ID": requestId,
    "X-Device": deviceInfo,
  };
}

export const requestIdLink = setContext((operation, previousContext) => {
  const { headers } = previousContext;

  const newHeaders = {
    ...headers,
    ...generateRequestHeaders(),
  };

  if (getAccessToken()) {
    newHeaders.Authorization = `Bearer ${getAccessToken()}`;
  }

  return {
    ...previousContext,
    headers: newHeaders,
  };
});

export const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach((err) => {
        switch (err.extensions.code) {
          case "UNAUTHENTICATED":
          case "TOKEN_EXPIRED":
            return fromPromise(
              fetch(graphQLEndpoint, {
                method: "POST",
                headers: {
                  ...generateRequestHeaders(),
                  accept: "*/*",
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  query: `mutation refresh($refreshToken: String!) {
                    refresh(refreshToken: $refreshToken) {
                      accessToken
                      refreshToken
                    }
                  }`,
                  variables: {
                    refreshToken: getRefreshToken(),
                  },
                }),
              })
                .then((res) => res.json())
                .then((res) => {
                  console.log("New tokens:", res.data.refresh);
                  saveTokenPair(res.data.refresh as TokenPair);
                  // Store the new tokens for your auth link
                  return res.data.accessToken;
                })
                .catch((error) => {
                  // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
                  removeTokenPair();
                  removeUser();
                })
            )
              .filter((value) => Boolean(value))
              .flatMap(() => {
                // retry the request, returning the new observable
                return forward(operation);
              });
        }
      });
    }

    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
      // if you would also like to retry automatically on
      // network errors, we recommend that you use
      // apollo-link-retry
    }
  }
);
