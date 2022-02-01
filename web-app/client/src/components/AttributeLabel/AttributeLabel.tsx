import React from "react";
import "./AttributeLabel.scss";

interface Props {
  text: string;
  labelColor: string;
}

const AttributeLabel: React.FC<Props> = ({ text, labelColor }) => (
  <p className="attribute-label text-black d-flex align-items-center my-0">
    <div
      className="circle rounded-pill me-2"
      style={{ backgroundColor: labelColor }}
    />
    {text}
  </p>
);

export default AttributeLabel;
