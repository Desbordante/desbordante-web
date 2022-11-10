import { FC, HTMLProps } from "react";
import styles from "./Alert.module.scss";
import classNames from "classnames";
import info from "@/assets/icons/info-blue.svg";
import Image from "next/image";

export const Alert: FC<HTMLProps<HTMLDivElement>> = ({
  className,
  children,
  ...props
}: HTMLProps<HTMLDivElement>) => (
  <article className={classNames(className, styles.wrapper)} {...props}>
    <Image src={info} alt="info" />
    <p>{children}</p>
  </article>
);
