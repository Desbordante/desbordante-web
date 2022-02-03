/* eslint-disable react/no-array-index-key */

import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import stringToColor from "../../functions/stringToColor";

interface Props {
  data: string[][];
  colorizedColumns: number[];
  showUncolorizedColumns?: boolean;
  className?: string;
}

const Table: React.FC<Props> = ({
  data,
  colorizedColumns,
  showUncolorizedColumns = true,
  className = "",
}) => {
  const uncolorizedColumns = [...Array(data[0].length)]
    .map((_, index) => index)
    .filter((index) => !colorizedColumns.includes(index));

  const headerClassName =
    "px-4 py-3 text-white text-nowrap text-center border-1 border-light";
  const bodyClassName = "border-1 border-light text-center py-1 px-2";

  return (
    <Container
      fluid
      className="w-100 px-0 overflow-auto snippet-container flex-grow-1 my-2"
    >
      <table className={className}>
        <thead>
          <tr className="bg-light">
            {colorizedColumns.map((index) => (
              <th
                key={data[0][index]}
                className={headerClassName}
                style={{
                  backgroundColor: stringToColor(data[0][index], 40, 40),
                }}
              >
                {data[0][index]}
              </th>
            ))}
            {showUncolorizedColumns &&
              uncolorizedColumns.map((index) => (
                <th
                  key={data[0][index]}
                  className={headerClassName}
                  style={{
                    backgroundColor: "#17151a",
                  }}
                >
                  {data[0][index]}
                </th>
              ))}
          </tr>
        </thead>

        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {colorizedColumns.map((index) => (
                <td
                  key={index}
                  className={bodyClassName}
                  style={{
                    backgroundColor: stringToColor(
                      data[0][index],
                      40,
                      rowIndex % 2 ? 75 : 85
                    ),
                  }}
                >
                  {row[index]}
                </td>
              ))}
              {showUncolorizedColumns &&
                uncolorizedColumns.map((index) => (
                  <td
                    key={index}
                    className={bodyClassName}
                    style={{
                      backgroundColor: `#17151a${rowIndex % 2 ? "35" : "15"}`,
                    }}
                  >
                    {row[index]}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
};

export default Table;
