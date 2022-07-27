import React, { ButtonHTMLAttributes } from "react";
import classNames from "classnames"
import styles from "./Button.module.scss";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  variant?: "gradient" | "primary" | "secondary" | "tetriaty";
  sizeStyle?: "sm" | "lg" | "md";
}

const Button: React.FC<Props> = ({
  onClick,
  disabled = false,
  variant = "tetriaty",
  className = "",
  children,
  sizeStyle = "md",
  ...rest
}) => {
  const defaultClassName = styles[variant]
  const defaultSizeClassName = styles[sizeStyle]
  return (
    <button
      {...rest}
      className={classNames(styles.button, defaultSizeClassName, defaultClassName, className)}
      onClick={!disabled ? onClick : () => {}}
    >
      <>{children}</>
    </button>
  );
}


export default Button;
