import React, { useContext, useRef } from "react";
import { TaskContext } from "../TaskContext/TaskContext";

import "./Phasename.scss";

const Phasename = () => {
  const { currentPhase, maxPhase, phaseName, progress } =
    useContext(TaskContext)!;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const clamp = (number: number, min: number, max: number) =>
    Math.min(max, Math.max(min, number));
  const message = `Phase ${currentPhase} of ${maxPhase}: ${phaseName}...`;

  const titleRef = useRef(null);
  const pointerWidth = 3 * rem;
  const titleWidth = titleRef.current
    ? parseFloat(getComputedStyle(titleRef.current!).width)
    : 0;
  const titleBorderRadius = 1 * rem;
  const margin = 1 * rem;

  const availableWidth = window.innerWidth;

  const titleTransform = clamp(
    availableWidth * progress - titleWidth / 2,
    margin,
    availableWidth - titleWidth - margin
  );

  const pointerTransform = clamp(
    availableWidth * progress - pointerWidth / 2,
    margin + titleBorderRadius,
    availableWidth - pointerWidth - titleBorderRadius - margin
  );

  let opacity = 1;
  if (
    availableWidth * progress <
    margin + titleBorderRadius + pointerWidth / 2
  ) {
    opacity =
      (availableWidth * progress) /
      (margin + titleBorderRadius + pointerWidth / 2);
  }
  if (
    availableWidth * progress >
    availableWidth - pointerWidth / 2 - titleBorderRadius - margin
  ) {
    opacity =
      (availableWidth * (1 - progress)) /
      (pointerWidth / 2 + titleBorderRadius + margin);
  }

  return (
    <div
      className={`position-absolute flex-column mt-2 d-${
        opacity ? "flex" : "none"
      }`}
      style={{
        opacity,
      }}
    >
      <img
        src="/icons/progressbar_pointer.svg"
        alt=""
        style={{
          transform: `translateX(${pointerTransform}px)`,
          width: pointerWidth,
        }}
      />
      <div
        ref={titleRef}
        className="phase-name bg-dark text-white text-center px-5 py-3"
        style={{
          transform: `translateX(${titleTransform}px)`,
          borderRadius: titleBorderRadius,
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default Phasename;
