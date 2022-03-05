import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { FileFormContext } from "../FileFormContext";
import Toggle from "../Toggle/Toggle";
import { PrimitiveType } from "../../types/globalTypes";

const tabs = [
  { alias: PrimitiveType.FD, name: "Functional Dependencies" },
  { alias: PrimitiveType.CFD, name: "Conditional Functional Dependencies" },
  { alias: PrimitiveType.AR, name: "Association Rules" },
];

const ChoosePrimitive = () => {
  const { primitiveType, setPrimitiveType } = useContext(FileFormContext)!;

  return (
    <Container fluid className="text-center py-3">
      {tabs.map(({ alias, name }) => (
        <Toggle
          className="mx-2 my-2"
          key={alias}
          toggleCondition={primitiveType === alias}
          onClick={() => setPrimitiveType(alias)}
        >
          {name}
        </Toggle>
      ))}
    </Container>
  );
};

export default ChoosePrimitive;
