import { setContext } from '@apollo/client/link/context';
import { fromPromise } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { v4 as uuidv4 } from 'uuid';
import { serverProxyURL } from '@constants/endpoints';
import { showError } from '@utils/toasts';
import {
  getAccessToken,
  getRefreshToken,
  removeTokenPair,
  removeUser,
  saveTokenPair,
} from '@utils/tokens';
import { TokenPair } from 'types/auth';

const generateServerSideInfo = () => {
  return Buffer.from(JSON.stringify(SSR_DEVICE_INFO)).toString('base64');
};

export function generateRequestHeaders() {
  const inBrowser = typeof window !== 'undefined';
  const deviceID = (inBrowser && localStorage.getItem('deviceID')) || '1';
  const deviceInfo =
    (inBrowser && localStorage.getItem('deviceInfo')) ||
    generateServerSideInfo();
  const userID = (inBrowser && localStorage.getItem('userID')) || 'server';
  const randomID = uuidv4();

  const requestId = `${deviceID}:${userID}:${randomID}`;

  return {
    'X-Request-ID': requestId,
    'X-Device': deviceInfo,
  };
}

export const requestIdLink = setContext((operation, previousContext) => {
  const { headers } = previousContext;

  const newHeaders = {
    ...headers,
    ...generateRequestHeaders(),
  };

  if (typeof window !== 'undefined' && getAccessToken()) {
    newHeaders.Authorization = `Bearer ${getAccessToken()}`;
  }

  return {
    ...previousContext,
    headers: newHeaders,
  };
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const resolvePendingRequests = () => {
  pendingRequests.map((callback) => callback());
  pendingRequests = [];
};

const getNewTokens = () => {
  return fetch(serverProxyURL, {
    method: 'POST',
    headers: {
      ...generateRequestHeaders(),
      accept: '*/*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation refresh($refreshToken: String!) {
          refresh(refreshToken: $refreshToken) {
            accessToken
            refreshToken
          }
        }
      `,
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
          case 'TOKEN_EXPIRED':
          case 'UNAUTHENTICATED':
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
                    console.error('Received an error! Logging out: ', error);
                    pendingRequests = [];
                    removeUser();
                    removeTokenPair();
                    // eslint-disable-next-line no-useless-return
                    return;
                  })
                  // eslint-disable-next-line @typescript-eslint/no-loop-func
                  .finally(() => {
                    isRefreshing = false;
                  }),
              ).filter((value) => Boolean(value));
            } else {
              forward$ = fromPromise(
                // eslint-disable-next-line @typescript-eslint/no-loop-func
                new Promise<void>((resolve) => {
                  pendingRequests.push(() => resolve());
                }),
              );
            }

            return forward$.flatMap(() => forward(operation));
          default:
            showError(err.extensions.code, `Error: ${err.message}`);
        }
      }
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  },
);

const SSR_DEVICE_INFO = {
  deviceID: 'server',
  userAgent: 'Mozilla/5.0',
  browser: 'Chrome',
  engine: 'Blink',
  os: '',
  osVersion: '',
  screen: '',
  plugins: '',
  timeZone: '+02',
  language: 'en-US',
};
