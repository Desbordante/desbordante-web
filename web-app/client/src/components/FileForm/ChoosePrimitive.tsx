import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { primitiveTypeList } from "../../types/types";
import { FileFormContext } from "../FileFormContext";
import Toggle from "../Toggle/Toggle";

const ChoosePrimitive = () => {
  const { primitiveType, setPrimitiveType } = useContext(FileFormContext)!;

  return (
    <Container fluid className="text-center py-3">
      {primitiveTypeList.map((type) => (
        <Toggle
          className="mx-2 my-2"
          key={type}
          toggleCondition={primitiveType === type}
          onClick={() => setPrimitiveType(type)}
        >
          {type}
        </Toggle>
      ))}
    </Container>
  );
};

export default ChoosePrimitive;
