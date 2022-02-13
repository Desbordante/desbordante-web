import React, { useState } from "react";
import { Container } from "react-bootstrap";
import Toggle from "../Toggle/Toggle";

interface Props {
  dependencyType: number;
  setDependencyType: React.Dispatch<React.SetStateAction<number>>;
}

const dependencyTypes = [
  "Functional Dependencies",
  "Conditional Functional Dependencies",
  "Associative Rules",
  "Error Detection",
];

const Greeting: React.FC<Props> = ({ dependencyType, setDependencyType }) => (
  <Container fluid className="text-center py-4">
    {dependencyTypes.map((type, index) => (
      <Toggle
        className="mx-2"
        toggleCondition={dependencyType === index}
        onClick={() => setDependencyType(index)}
      >
        {type}
      </Toggle>
    ))}
  </Container>
);

export default Greeting;
