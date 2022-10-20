import { serverIP, serverPort, serverProtocol } from '@utils/env';

export const serverURL = `${serverProtocol}://${serverIP}:${serverPort}`;
export const serverLocalURL = `${serverProtocol}://localhost:${serverPort}`;
export const graphQLEndpoint = `${serverURL}/graphql`;
export const graphQLLocalEndpoint = `${serverLocalURL}/graphql`;
