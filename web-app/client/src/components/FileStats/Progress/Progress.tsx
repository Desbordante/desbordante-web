import classNames from 'classnames';
import { FC, HTMLProps } from 'react';
import styles from './Progress.module.scss';

type ProgressProps = {
  value: number;
} & HTMLProps<HTMLDivElement>;

export const Progress: FC<ProgressProps> = ({
  value,
  id,
  className,
  ...props
}: ProgressProps) => (
  <article className={classNames(className, styles.wrapper)} {...props}>
    <div
      className={styles.bar}
      style={{ width: `${value}%` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    />
    <progress max={100} value={value} id={id} />
  </article>
);
