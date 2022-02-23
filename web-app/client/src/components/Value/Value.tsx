import React, { useState, useEffect, useCallback } from "react";
import "./Value.scss";

/* eslint-disable no-unused-vars */
interface Props {
  value: string;
  onChange: (str: string) => void;
  inputValidator: (str?: string) => boolean;
  size?: number;
  className?: string;
}
/* eslint-enable no-unused-vars */

const cropString = (str: string, maxLength: number, ending: string) => {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(maxLength - ending.length) + ending;
};

const Value: React.FC<Props> = ({
  value,
  onChange,
  inputValidator,
  size = 5,
  className = "",
}) => {
  const [isValid, setIsValid] = useState(inputValidator(value));

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  useEffect(() => setIsValid(inputValidator(value)), [value, inputValidator]);

  return (
    <input
      type="text"
      value={value}
      className={`value ${
        isValid
          ? "text-light border-lighter-dark bg-transparent"
          : "text-danger border-danger bg-danger bg-opacity-10"
      } text-center border border-2 outline-0 px-2 py-2 rounded-pill cursor-pointer ${className}`}
      size={size}
      onChange={inputHandler}
    />
  );
};

export default Value;
