/* eslint-disable no-console */
import axios from "axios";
import React, { useState, useEffect } from "react";
import { coloredDepedency } from "../../types";
import "./Snippet.scss";

import { serverURL } from "../../APIFunctions";

interface Props {
  taskId: string;
  selectedDependency: coloredDepedency | undefined;
}

/* eslint-disable prefer-template */
/* eslint-disable no-cond-assign */
/* eslint-disable prefer-destructuring */

const MAX_LENGTH = 100;

// eslint-disable-next-line max-len
function getSelectedIndices(
  dep: coloredDepedency | undefined,
  header: string[]
): Map<number, string> {
  const selectedIndices = new Map<number, string>();
  if (dep === undefined) {
    return selectedIndices;
  }
  dep.lhs.forEach((lhs) =>
    selectedIndices.set(header.indexOf(lhs.name), lhs.color));
  selectedIndices.set(header.indexOf(dep.rhs.name), dep.rhs.color);
  return selectedIndices;
}

const Snippet: React.FC<Props> = ({ taskId, selectedDependency }) => {
  const [table, setTable] = useState<string[][]>([[]]);
  const selectedIndices: Map<number, string> = getSelectedIndices(
    selectedDependency,
    table[0]
  );

  useEffect(() => {
    axios
      .get(`${serverURL}/getSnippet/${taskId}`)
      .then((res) => setTable(res.data));
  }, []);

  return (
    <table>
      {table === undefined ? (
        <></>
      ) : (
        table
          .filter((val, idx) => idx < MAX_LENGTH)
          .map((value, index) => (
            <tr
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              {value
                .filter((cell, idx) => idx !== value.length - 1 || cell !== "")
                .map((cell, idx) => (
                  <td
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    style={
                      selectedIndices.get(idx) !== undefined
                        ? { backgroundColor: selectedIndices.get(idx) + "90" }
                        : { backgroundColor: "#ffffff" }
                    }
                  >
                    {cell}
                  </td>
                ))}
            </tr>
          ))
      )}
    </table>
  );
};

export default Snippet;
