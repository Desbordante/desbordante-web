import { ApolloClient, Operation } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import { v4 as uuidv4 } from "uuid";
import { graphQLEndpoint } from "../APIFunctions";
import {
  getAccessToken,
  getRefreshToken,
  removeTokenPair,
  setAccessToken,
} from "../functions/authTokens";

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

// export const tokenRefreshLink = new TokenRefreshLink({
//   accessTokenField: "accessToken",
//   isTokenValidOrUndefined: () => !!getAccessToken(),
//   fetchAccessToken: () => {
//     if (!getRefreshToken()) {
//       removeTokenPair();
//     }

//     return fetch(graphQLEndpoint, {
//       method: "POST",
//       headers: {
//         ...generateRequestHeaders(),
//         accept: "*/*",
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({
//         query: `
//         mutation {
//           refresh(refreshToken: ${getRefreshToken()}) {
//             accessToken
//             refreshToken
//           }
//         }
//         `,
//       }),
//     });
//   },
//   handleFetch: (accessToken: string, operation: Operation) => {
//     console.log("Got new access token", accessToken);
//     setAccessToken(accessToken, 20);
//   },
// });
