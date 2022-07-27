import React, { HTMLProps } from "react";

import styles from "./Button.module.scss";

interface Props extends HTMLProps<HTMLButtonElement>{
  enabled?: boolean;
  variant?: string;
  sizeStyle?: "sm" | "lg" | "md";
}

const Button: React.FC<Props> = ({
  onClick,
  enabled = true,
  variant = "light",
  className = "",
  children,
  style,
  title,
  sizeStyle = "md"
}) => {
  const defaultClassName = styles[variant]
  const defaultSizeClassName = styles[sizeStyle]
  return (
    <button
      className={`${styles.button} ${defaultSizeClassName} ${defaultClassName} ${className}`}
      onClick={enabled ? onClick : () => {}}
      style={style}
      title={title}
    >
      <>{children}</>
    </button>
  );
}


export default Button;
