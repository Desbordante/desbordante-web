import {
  serverIP,
  serverPort,
  serverProtocol,
  serverLocalIP,
} from '@utils/env';

export const serverURL = `${serverProtocol}://${serverIP}:${serverPort}`;
export const serverLocalURL = `${serverProtocol}://${serverLocalIP}:${serverPort}`;
export const graphQLEndpoint = `${serverURL}/graphql`;
export const graphQLLocalEndpoint = `${serverLocalURL}/graphql`;
