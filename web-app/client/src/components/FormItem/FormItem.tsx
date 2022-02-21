import React from "react";

import "./FormItem.scss";
import { Col } from "react-bootstrap";

interface Props {
  enabled?: boolean;
}

const FormItem: React.FC<Props> = ({ enabled = true, children }) => (
  <Col
    xxl={6}
    className="form-item my-2 position-relative d-flex align-items-center flex-wrap"
  >
    {!enabled && (
      <div className="form-item-shadow position-absolute w-100 h-100 bg-dark bg-opacity-50" />
    )}
    {children}
  </Col>
);

export default FormItem;
