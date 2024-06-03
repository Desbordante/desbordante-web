import classNames from 'classnames';
import { FC, HTMLProps, ReactNode } from 'react';
import styles from './Group.module.scss';

type GroupProps = {
  header?: ReactNode;
} & HTMLProps<HTMLDivElement>;

export const Group: FC<GroupProps> = ({
  className,
  children,
  header,
  ...props
}: GroupProps) => (
  <section className={classNames(className, styles.wrapper)} {...props}>
    {header && <h5>{header}</h5>}
    <div className={styles.inner}>{children}</div>
  </section>
);
