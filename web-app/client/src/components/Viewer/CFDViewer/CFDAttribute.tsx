import React from "react";
import styled from "styled-components";

import colors from "../../../colors";
import stringToColor from "../../../functions/stringToColor";

const AttributeContainer = styled.div`
  transition: 0.3s;
`;
const AttributeName = styled.div``;
const Pattern = styled.div`
  transition: 0.3s;
`;

const wildCard = "_";

interface Props {
  attribute: string;
  pattern: string;
  isSelected: boolean;
  isPatternShown: boolean;
}

const CFDAttribute: React.FC<Props> = ({
  attribute,
  pattern,
  isSelected,
  isPatternShown,
}) => (
  <AttributeContainer
    className="d-flex mx-2 rounded-pill overflow-hidden"
    style={{
      backgroundColor: isSelected
        ? stringToColor(attribute, 60, 70)
        : colors.light,
      color: isSelected ? "#FFF" : "#000",
    }}
  >
    <AttributeName className="px-3 py-2">{attribute}</AttributeName>
    {isPatternShown && (
      <Pattern
        className="px-3 py-2"
        style={{
          backgroundColor: isSelected
            ? stringToColor(attribute, 60, pattern === wildCard ? 40 : 60)
            : colors.darkerLight,
          color: isSelected ? "#FFF" : "#000",
        }}
      >
        {pattern}
      </Pattern>
    )}
  </AttributeContainer>
);

export default CFDAttribute;
