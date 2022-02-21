import React from "react";

import "./SelectedAttribute.scss";
import { attribute } from "../../types";

/* eslint-disable no-unused-vars */
interface Props {
  text: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}
/* eslint-enable no-unused-vars */

const SelectedAttribute: React.FC<Props> = ({ text, onClick }) => (
  <div
    className="selected-attribute bg-dark bg-opacity-10 m-1 d-flex align-items-center rounded-pill px-2 py-1"
    onClick={onClick}
  >
    <p className="my-auto mx-1">{text}</p>
    <img
      src="/icons/cross.svg"
      alt="d"
      className="bg-primary p-1 rounded-circle"
    />
  </div>
);

export default SelectedAttribute;
