import React from "react";
import styled from "styled-components";
import { Col } from "react-bootstrap";

interface ShadowProps {
  enabled: boolean;
}

const Shadow = styled.div<ShadowProps>`
  z-index: 10;
  pointer-events: ${(props) => (props.enabled ? "auto" : "none")};
  opacity: ${(props) => (props.enabled ? "0.75" : "0")};
  transition: opacity 0.3s;
`;

interface Props {
  enabled?: boolean;
}

const FormItem: React.FC<Props> = ({ enabled = true, children }) => (
  <Col
    xxl={6}
    className="form-item my-2 position-relative d-flex align-items-center flex-wrap"
  >
    <Shadow
      enabled={!enabled}
      className="form-item-shadow position-absolute w-100 h-100 bg-dark"
    />
    {children}
  </Col>
);

export default FormItem;
