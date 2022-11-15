import { FC, HTMLProps } from "react";
import styles from "./Table.module.scss";
import classNames from "classnames";

export const Table: FC<HTMLProps<HTMLTableElement>> = ({
  className,
  ...props
}: HTMLProps<HTMLTableElement>) => (
  <table className={classNames(className, styles.wrapper)} {...props} />
);
