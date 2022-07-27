import React, { HTMLProps } from "react";

import styles from "./Button.module.scss";

interface Props extends HTMLProps<HTMLButtonElement>{
  variant?: "gradient" | "primary" | "secondary" | "tetriaty";
  sizeStyle?: "sm" | "lg" | "md";
}

const Button: React.FC<Props> = ({
  onClick,
  disabled = false,
  variant = "tetriaty",
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
      onClick={!disabled ? onClick : () => {}}
      style={style}
      title={title}
    >
      <>{children}</>
    </button>
  );
}


export default Button;
