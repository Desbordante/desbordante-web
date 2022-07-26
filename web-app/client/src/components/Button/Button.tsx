import React, { ReactNode } from "react";
import { Button as Btn } from "react-bootstrap";

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
  size,
}) => {
  const defaultClassName = styles[variant]
  return (
    <span tabIndex={0}
      className={`${defaultClassName} ${className}`}
      onClick={enabled ? onClick : () => {}}
    >
      <>{children}</>
    </span>
  );
}

export default Button;
