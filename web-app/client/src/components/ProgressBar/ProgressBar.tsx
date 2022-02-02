import React from "react";
import "./ProgressBar.scss";

interface Props {
  progress: number;
  maxWidth?: number;
  thickness?: number;
  rounded?: boolean;
}

const ProgressBar: React.FC<Props> = ({
  progress,
  maxWidth = 100,
  thickness = 5,
  rounded = false,
}) => {
  const barWidth = maxWidth * progress;

  const style = {
    width: `${maxWidth}%`,
    height: `${thickness}rem`,
    borderRadius: rounded ? "1000px" : 0,
  };

  return (
    <div
      className="bg-lighter-dark position-relative d-flex align-items-center"
      style={style}
    >
      <div
        className="progress-accent"
        style={{ ...style, width: `${barWidth}%` }}
      />
    </div>
  );
};

export default ProgressBar;
