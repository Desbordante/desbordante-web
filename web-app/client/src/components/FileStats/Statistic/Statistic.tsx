import classNames from 'classnames';
import { FC, HTMLProps } from 'react';
import styles from './Statistic.module.scss';

export type StatisticSize = 'sm' | 'md' | 'lg' | 'xl';

type StatisticProps = {
  size?: StatisticSize;
  header?: string;
} & Omit<HTMLProps<HTMLDivElement>, 'size'>;

export const Statistic: FC<StatisticProps> = ({
  size,
  className,
  children,
  header,
  ...props
}: StatisticProps) => (
  <article
    className={classNames(className, styles.wrapper, size && styles[size])}
    {...props}
  >
    <span className={styles.header}>{header}</span>
    <span className={styles.inner}>{children}</span>
  </article>
);
