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

let isRefreshing = false;
let pendingRequests: any = [];

const resolvePendingRequests = () => {
  pendingRequests.map((callback: any) => callback());
  pendingRequests = [];
};

const getNewTokens = () => {
  return fetch(graphQLEndpoint, {
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
    .then((res) => res.data.refresh);
};

export const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of graphQLErrors) {
        switch (err.extensions.code) {
          case "TOKEN_EXPIRED":
            // eslint-disable-next-line no-case-declarations
            let forward$;

            if (!isRefreshing) {
              isRefreshing = true;
              forward$ = fromPromise(
                getNewTokens()
                  .then((tokens: TokenPair) => {
                    saveTokenPair(tokens);
                    resolvePendingRequests();
                    return tokens.accessToken;
                  })
                  // eslint-disable-next-line @typescript-eslint/no-loop-func
                  .catch((error) => {
                    console.error("Received an error! Logging out: ", error);
                    pendingRequests = [];
                    removeUser();
                    removeTokenPair();
                    // eslint-disable-next-line no-useless-return
                    return;
                  })
                  // eslint-disable-next-line @typescript-eslint/no-loop-func
                  .finally(() => {
                    isRefreshing = false;
                  })
              ).filter((value) => Boolean(value));
            } else {
              forward$ = fromPromise(
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                new Promise<void>((resolve) => {
                  pendingRequests.push(() => resolve());
                })
              );
            }

            return forward$.flatMap(() => forward(operation));
        }
      }
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  }
);
