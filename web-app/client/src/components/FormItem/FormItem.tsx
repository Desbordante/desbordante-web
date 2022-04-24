import React from "react";
import styled from "styled-components";
import { Col } from "react-bootstrap";

interface ShadowProps {
  enabled: boolean;
}

const Shadow = styled.div<ShadowProps>`
  z-index: 10;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
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
    className="px-0 my-2 position-relative d-flex align-items-center flex-wrap"
  >
    <Shadow
      enabled={!enabled}
      className="form-item-shadow position-absolute bg-dark"
    />
    <>{children}</>
  </Col>
);

export default FormItem;
