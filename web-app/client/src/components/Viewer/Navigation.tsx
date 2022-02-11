import React from "react";
import { Container } from "react-bootstrap";

import Toggle from "../Toggle/Toggle";

interface Props {
  partShown: number;
  setPartShown: React.Dispatch<React.SetStateAction<number>>;
}

const Navigation: React.FC<Props> = ({ partShown, setPartShown }) => (
  <Container
    fluid
    className="d-flex flex-wrap align-items-center mb-2 position-sticky"
  >
    <h3 className="mx-2 fw-bold">Display</h3>
    <Toggle
      toggleCondition={partShown === 0}
      variant="dark"
      onClick={() => setPartShown(0)}
      className="mx-2"
    >
      Attributes
    </Toggle>
    <Toggle
      toggleCondition={partShown === 1}
      variant="dark"
      onClick={() => setPartShown(1)}
      className="mx-2"
    >
      Dependencies
    </Toggle>
    <Toggle
      toggleCondition={partShown === 2}
      variant="dark"
      onClick={() => setPartShown(2)}
      className="mx-2"
    >
      Dataset
    </Toggle>
  </Container>
);

export default Navigation;
