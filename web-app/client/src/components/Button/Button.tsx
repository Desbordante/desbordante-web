import React from "react";
import { Button as Btn } from "react-bootstrap";

import "./Button.scss";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  enabled?: boolean;
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<Props> = ({
  onClick,
  enabled = true,
  variant = "light",
  className = "",
  children,
  style,
}) => (
  <Btn
    disabled={!enabled}
    variant={variant}
    className={`text-nowrap px-3 py-2 rounded-pill cursor-pointer ${className}`}
    onClick={enabled ? onClick : () => {}}
    style={style}
  >
    {children}
  </Btn>
);

export default Button;
