import React, { useState } from "react";
import styled from "styled-components";

import stringToColor from "../../../functions/stringToColor";
import colors from "../../../colors";
import { ConditionalDependency } from "../../../types/taskInfo";
import Toggle from "../../Toggle/Toggle";
import CFDAttribute from "./CFDAttribute";

const DependencyContainer = styled.div`
  transition: 0.3s;

  &:hover {
    transform: translateX(0.3rem);
  }
`;

const Arrow = styled.svg`
  width: 5rem;
  stroke: ${colors.light};

  &.active {
    stroke: ${colors.buttonBlack};
  }
`;

interface Props {
  dependency: ConditionalDependency;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onActiveClick: React.MouseEventHandler<HTMLDivElement>;
  isPatternShown: boolean;
}

const CFDSnippet: React.FC<Props> = ({
  dependency,
  isActive,
  onClick,
  onActiveClick,
  isPatternShown,
}) => (
  <DependencyContainer
    className="d-flex my-1"
    role="button"
    tabIndex={0}
    onClick={isActive ? onActiveClick : onClick}
  >
    {dependency.lhs.map((attr, index) => (
      <CFDAttribute
        key={attr}
        attribute={attr}
        pattern={dependency.lhsPatterns[index]}
        isSelected={isActive}
        isPatternShown={isPatternShown}
      />
    ))}

    <div className="d-flex align-items-center justify-content-center position-relative mx-2">
      <Arrow
        className={`arrow ${isActive ? "active" : ""}`}
        viewBox="0 0 58.73 20.09"
      >
        <line x1="58.23" y1="10.05" x2="0.5" y2="10.05" />
        <line x1="48.68" y1="0.5" x2="58.23" y2="10.05" />
        <line x1="58.23" y1="10.05" x2="48.68" y2="19.59" />
      </Arrow>
    </div>

    <CFDAttribute
      attribute={dependency.rhs}
      pattern={dependency.rhsPattern}
      isSelected={isActive}
      isPatternShown={isPatternShown}
    />
  </DependencyContainer>
);

export default CFDSnippet;
