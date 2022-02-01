import React from "react";

import "./Button.scss";

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  enabled?: boolean;
  variant?: "light" | "dark" | "danger";
  className?: string;
}

const Button: React.FC<Props> = ({
  onClick,
  enabled = true,
  variant = "light",
  className = "",
  children,
}) => (
  <button
    type="button"
    className={`button ${enabled ? "" : "disabled"} bg-${variant} text-${
      variant === "light" ? "black" : "white"
    } text-nowrap border-0 outline-0 px-3 py-2 rounded-pill cursor-pointer ${className}`}
    onClick={enabled ? onClick : () => {}}
  >
    {children}
  </button>
);

export default Button;
