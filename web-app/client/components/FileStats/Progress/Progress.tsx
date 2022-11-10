import { FC, HTMLProps } from "react";
import styles from "./Progress.module.scss";
import classNames from "classnames";

type ProgressProps = {
  value: number;
} & HTMLProps<HTMLDivElement>;

export const Progress: FC<ProgressProps> = ({
  value,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) => (
  <article className={classNames(className, styles.wrapper)} {...props}>
    <div className={styles.bar} style={{ width: `${value}%` }} />
  </article>
);
