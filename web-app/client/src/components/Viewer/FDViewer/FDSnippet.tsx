import React from "react";
import styled from "styled-components";

import stringToColor from "../../../functions/stringToColor";
import colors from "../../../colors";
import { FD } from "../../../graphql/operations/fragments/__generated__/FD";

const DependencyContainer = styled.div`
  transition: 0.3s;

  &:hover {
    transform: translateX(0.5rem);
  }
`;

const Attribute = styled.div`
  transition: 0.3s;
`;

const Arrow = styled.svg`
  width: 5rem;
  stroke: ${colors.light};

  &.active {
    stroke: ${colors.buttonBlack};
  }
`;

interface Props {
  dependency: FD;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onActiveClick: React.MouseEventHandler<HTMLDivElement>;
}

const FDSnippet: React.FC<Props> = ({
  dependency,
  isActive,
  onClick,
  onActiveClick,
}) => (
  <DependencyContainer
    className="d-flex my-1"
    role="button"
    tabIndex={0}
    onClick={isActive ? onActiveClick : onClick}
  >
    {dependency.lhs.map((attr) => (
      <Attribute
        style={
          isActive
            ? {
                backgroundColor: stringToColor(attr.name, 60, 70),
              }
            : {
                backgroundColor: "#E5E5E5",
              }
        }
        className={`d-flex align-items-center px-3 py-2 mx-2 rounded-pill text-${
          isActive ? "white" : "black"
        }`}
        key={attr.index}
      >
        {attr.name}
      </Attribute>
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

    <Attribute
      style={
        isActive
          ? {
              backgroundColor: stringToColor(dependency.rhs.name, 60, 70),
            }
          : { backgroundColor: "#E5E5E5" }
      }
      className={`d-flex align-items-center px-3 py-2 mx-2 rounded-pill text-${
        isActive ? "white" : "black"
      }`}
    >
      {dependency.rhs.name}
    </Attribute>
  </DependencyContainer>
);

export default FDSnippet;
