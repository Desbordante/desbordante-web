import React from "react";
import { Container } from "react-bootstrap";

import "./StatusDisplay.scss";

interface Props {
  text: string;
}

const StatusDisplay: React.FC<Props> = ({ text }) => (
  <Container className="status-display w-100 h-100 flex-grow-1 d-flex align-items-center justify-content-center">
    <h1 className="fw-bold mx-2">{text}</h1>
    <img src="/images/loading.gif" alt="" />
  </Container>
);

export default StatusDisplay;
