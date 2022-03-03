import React from "react";
import { Container } from "react-bootstrap";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";

interface Props {
  children: React.ReactNode;
  disable: () => void;
}

const BuiltinDatasetSelector: React.FC<Props> = ({ children, disable }) => (
  <PopupWindowContainer onOutsideClick={disable}>
    <Container className="p-4 bg-dark rounded-3 shadow-lg">
      {children}
    </Container>
  </PopupWindowContainer>
);

export default BuiltinDatasetSelector;
