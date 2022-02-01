/* eslint-disable react/no-array-index-key */

import React from "react";
import stringToColor from "../../functions/stringToColor";

interface Props {
  data: string[][];
  colorize?: boolean;
}

const Table: React.FC<Props> = ({ data, colorize = false }) => (
  <table>
    <thead>
      <tr className="rounded-top">
        {data[0].map((attr) => (
          <th
            key={attr}
            className="px-4 py-3 text-white text-center text-nowrap border-2 border-light"
            style={{
              backgroundColor: colorize
                ? stringToColor(attr, 40, 40)
                : "#17151a",
            }}
          >
            {attr}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {data.slice(1).map((row, rowIndex) => (
        <tr key={rowIndex}>
          {row.map((attr, attrIndex) => (
            <td
              key={attrIndex}
              className="text-center py-1 px-2 border-2 border-light text-nowrap"
              style={{
                backgroundColor: colorize
                  ? stringToColor(data[0][attrIndex], 40, 80)
                  : "#17151a10",
              }}
            >
              {attr}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
