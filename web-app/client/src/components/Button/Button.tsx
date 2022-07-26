import React from "react";

import styles from "./Button.module.scss";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  enabled?: boolean;
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "lg";
}

const Button: React.FC<Props> = ({
  onClick,
  enabled = true,
  variant = "light",
  className = "",
  children,
  style,
  size = "md",
}) => {
  const defaultClassName = styles[variant]
  const defaultSizeClassName = styles[size]
  return (
    <span tabIndex={0}
      className={`${styles.button} ${defaultSizeClassName} ${defaultClassName} ${className}`}
      onClick={enabled ? onClick : () => {}}
      style={style}
    >
      <>{children}</>
    </span>
  );
}

export default Button;
