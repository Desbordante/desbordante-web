import React from "react";
import "./SearchBar.scss";

/* eslint-disable no-unused-vars */
interface Props {
  defaultText: string;
  onChange: (str: string) => void;
  className?: string;
}
/* eslint-enable no-unused-vars */

const SearchBar: React.FC<Props> = ({
  defaultText,
  onChange,
  className = "",
}) => (
  <div className="search-bar">
    <input
      type="text"
      className={`search-input rounded-pill py-2 px-3 border-0 bg-dark bg-opacity-10 ${className}`}
      size={20}
      placeholder={defaultText}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
