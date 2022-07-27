import React from "react";
import styled from "styled-components";

import colors from "../../../colors";
import stringToColor from "../../../functions/stringToColor";
import { AR } from "../../../graphql/operations/fragments/__generated__/AR";

const StyledRule = styled.div`
  transition: 0.3s;
  * {
    transition: 0.3s;
  }

  &:hover {
    transform: translateX(0.5rem);
  }

  .arrow {
    width: 5rem;
    stroke: ${colors.light};

    &.active {
      stroke: ${colors.buttonBlack};
    }
  }

  p {
    font-size: 0.8rem;
  }
`;

interface Props {
  rule: AR;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onActiveClick: React.MouseEventHandler<HTMLDivElement>;
}

const ARSnippet: React.FC<Props> = ({
  rule,
  isActive,
  onClick,
  onActiveClick,
}) => (
  <StyledRule
    className="d-flex my-1"
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
  </StyledRule>
);

export default ARSnippet;
