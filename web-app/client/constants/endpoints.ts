import { serverIP, serverPort, serverProtocol } from '@utils/env';

export const serverURL = `${serverProtocol}://${serverIP}:${serverPort}`;
export const graphQLEndpoint = `${serverURL}/graphql`;
