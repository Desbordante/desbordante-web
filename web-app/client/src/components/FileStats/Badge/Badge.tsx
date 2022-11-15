import { FC, HTMLProps } from "react";
import styles from "./Badge.module.scss";
import classNames from "classnames";

export type BadgeSize = "primary" | "secondary";

type BadgeProps = {
  mode?: BadgeSize;
} & HTMLProps<HTMLDivElement>;

export const Badge: FC<BadgeProps> = ({
  mode = "primary",
  className,
  ...props
}: BadgeProps) => (
  <article
    className={classNames(className, styles.wrapper, styles[mode])}
    {...props}
  />
);
