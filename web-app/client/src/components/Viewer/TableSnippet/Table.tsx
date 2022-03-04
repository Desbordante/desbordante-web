/* eslint-disable react/no-array-index-key */

import React from "react";
import { Container } from "react-bootstrap";
import stringToColor from "../../../functions/stringToColor";

interface Props {
  header: string[];
  rows: string[][];
  colorizedColumns: number[];
  showUncolorizedColumns?: boolean;
  className?: string;
}

const Table: React.FC<Props> = ({
  header,
  rows,
  colorizedColumns,
  showUncolorizedColumns = true,
  className = "",
}) => {
  const uncolorizedColumns = [...Array(header.length)]
    .map((_, index) => index)
    .filter((index) => !colorizedColumns.includes(index));

  const headerClassName = "px-4 py-3 text-white text-nowrap text-center";
  const bodyClassName = "text-center py-1 px-2";

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
                key={header[index]}
                className={headerClassName}
                style={{
                  backgroundColor: stringToColor(header[index], 60, 70),
                }}
              >
                {header[index]}
              </th>
            ))}
            {showUncolorizedColumns &&
              uncolorizedColumns.map((index) => (
                <th
                  key={header[index]}
                  className={headerClassName}
                  style={{
                    backgroundColor: "#17151a",
                  }}
                >
                  {header[index]}
                </th>
              ))}
          </tr>
        </thead>

        <tbody>
          {rows.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {colorizedColumns.map((index) => (
                <td
                  key={index}
                  className={bodyClassName}
                  style={{
                    backgroundColor: stringToColor(
                      header[index],
                      15,
                      rowIndex % 2 ? 80 : 90
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
                      backgroundColor: stringToColor(
                        header[index],
                        0,
                        rowIndex % 2 ? 80 : 90
                      ),
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
