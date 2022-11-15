import { FC, HTMLProps } from "react";
import styles from "./Paper.module.scss";
import classNames from "classnames";

export const Paper: FC<HTMLProps<HTMLDivElement>> = ({
  className,
  ...props
}: HTMLProps<HTMLDivElement>) => (
  <article className={classNames(className, styles.wrapper)} {...props} />
);
