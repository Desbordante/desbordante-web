import React from "react";

import { dependency } from "../../types/types";
import stringToColor from "../../functions/stringToColor";
import "./Dependency.scss";

interface Props {
  dep: dependency;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onActiveClick: React.MouseEventHandler<HTMLDivElement>;
}

const Dependency: React.FC<Props> = ({
  dep,
  isActive,
  onClick,
  onActiveClick,
}) => (
  <div
    className="dependency d-flex my-1"
    role="button"
    tabIndex={0}
    onClick={isActive ? onActiveClick : onClick}
  >
    {dep.lhs.map((attr) => (
      <div
        style={
          isActive
            ? {
                backgroundColor: stringToColor(attr, 60, 70),
              }
            : {
                backgroundColor: "#E5E5E5",
              }
        }
        className={`attribute-name d-flex align-items-center px-3 py-2 mx-2 rounded-pill text-${
          isActive ? "white" : "black"
        }`}
        key={attr}
      >
        {attr}
      </div>
    ))}

    <svg
      className={`arrow ${isActive ? "active" : ""}`}
      viewBox="0 0 58.73 20.09"
    >
      <line x1="48.68" y1="0.5" x2="58.23" y2="10.05" />
      <line x1="58.23" y1="10.05" x2="48.68" y2="19.59" />
      <line x1="58.23" y1="10.05" x2="0.5" y2="10.05" />
    </svg>

    <div
      style={
        isActive
          ? {
              backgroundColor: stringToColor(dep.rhs, 60, 70),
            }
          : { backgroundColor: "#E5E5E5" }
      }
      className={`attribute-name d-flex align-items-center px-3 py-2 mx-2 rounded-pill text-${
        isActive ? "white" : "black"
      }`}
    >
      {dep.rhs}
    </div>
  </div>
);

export default Dependency;
