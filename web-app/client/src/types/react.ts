import { FC, ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
export type FCWithChildren<T = {}> = FC<
  T & {
    children?: ReactNode;
  }
>;
