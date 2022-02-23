import React from "react";

import { associationRule } from "../../types/types";
import stringToColor from "../../functions/stringToColor";
import "./AssociationRule.scss";

interface Props {
  rule: associationRule;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onActiveClick: React.MouseEventHandler<HTMLDivElement>;
}

const AssociationRule: React.FC<Props> = ({
  rule,
  isActive,
  onClick,
  onActiveClick,
}) => (
  <div
    className="association-rule d-flex my-1"
    role="button"
    tabIndex={0}
    onClick={isActive ? onActiveClick : onClick}
  >
    {rule.lhs.map((attr) => (
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

    <div className="d-flex align-items-center justify-content-center position-relative mx-2">
      <p
        className={`position-absolute mb-0 bg-light px-1 border border-${
          isActive ? "dark" : ""
        } border-2 rounded-pill text-${isActive ? "black" : "grey"}`}
      >
        {Math.round(rule.confidence * 1000) / 10}%
      </p>
      <svg
        className={`arrow ${isActive ? "active" : ""}`}
        viewBox="0 0 58.73 20.09"
      >
        <line x1="58.23" y1="10.05" x2="0.5" y2="10.05" />
        <line x1="48.68" y1="0.5" x2="58.23" y2="10.05" />
        <line x1="58.23" y1="10.05" x2="48.68" y2="19.59" />
      </svg>
    </div>

    {rule.rhs.map((attr) => (
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
  </div>
);

export default AssociationRule;
