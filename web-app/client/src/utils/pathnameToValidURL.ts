import { port } from './env';

export const pathnameToLocalURL = (pathname: string) =>
  `http://localhost:${port}${pathname}`;
