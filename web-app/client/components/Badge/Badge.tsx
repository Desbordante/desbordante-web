import { FC, HTMLProps } from "react";
import styles from "./Badge.module.scss";
import classNames from "classnames";

type BadgeProps = {
  mode?: "primary" | "secondary";
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
