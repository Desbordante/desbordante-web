import { FC, ReactNode } from 'react';

type ToastProps = {
  header?: ReactNode;
  children: ReactNode;
};

export const Toast: FC<ToastProps> = ({ header, children }: ToastProps) => (
  <>
    {header && <p>{header}</p>}
    <small>{children}</small>
  </>
);
