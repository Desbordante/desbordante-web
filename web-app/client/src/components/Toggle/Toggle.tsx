import React from "react";
import "./Toggle.scss";

interface Props {
  toggleCondition: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isEnabled?: boolean;
  variant?: "light" | "dark";
  className?: string;
}

const Toggle: React.FC<Props> = ({
  toggleCondition,
  onClick,
  isEnabled = true,
  variant = "light",
  className = "",
  children,
}) => (
  <button
    type="button"
    className={`toggle ${
      isEnabled && toggleCondition
        ? `bg-${variant} text-${variant === "light" ? "black" : "white"}`
        : "bg-transparent text-grey"
    } text-nowrap border border-${
      variant === "light" ? "lighter-dark" : "secondary"
    } border-2 outline-0 px-3 py-2 rounded-pill cursor-pointer ${className}`}
    style={{}}
    onClick={isEnabled ? onClick : () => {}}
  >
    {children}
  </button>
);

export default Toggle;
