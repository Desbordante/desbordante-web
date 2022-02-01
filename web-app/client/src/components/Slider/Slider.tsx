import React from "react";
import "./Slider.scss";

/* eslint-disable no-unused-vars */
interface Props {
  value: string;
  onChange: (str: string) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}
/* eslint-enable no-unused-vars */

const Slider: React.FC<Props> = ({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.005,
  className = "",
}) => (
  <input
    type="range"
    min={min}
    max={max}
    value={value}
    step={step}
    className={`slider ${className}`}
    onChange={(e) => onChange(e.target.value)}
  />
);

export default Slider;
