import React, { useState } from "react";

interface Props {
  rating: number;
  onChange: (n: number) => void;
  max: number;
}

const StarRatingPicker: React.FC<Props> = ({ max, onChange, rating }) => {
  const [selectedMark, setSelectedMark] = useState(rating);
  const [hover, setHover] = useState(false);

  return (
    <h3
      className={`text-primary opacity-${hover ? "75" : "100"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setSelectedMark(rating);
      }}
    >
      {[...Array(max)].map((_, idx) => (
        <i
          /* eslint-disable-next-line react/no-array-index-key */
          key={idx}
          className={`cursor-pointer mx-1 bi bi-star${
            idx < selectedMark ? "-fill" : ""
          }`}
          onMouseEnter={() => setSelectedMark(idx + 1)}
          onClick={() => onChange(idx + 1)}
        />
      ))}
    </h3>
  );
};

export default StarRatingPicker;
