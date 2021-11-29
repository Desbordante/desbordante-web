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

const MAX_LENGTH = 100;
const DISTANCE_BETWEEN_CELLS = 1;

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

function range(start: number, end: number): number[] {
  return Array.from(Array(end - start + 1), (_, i) => i + start);
}

function getDotsIndices(selectedIndices: Map<number, string>): number[] {
  const buffer = Array.from(selectedIndices.keys()).sort();
  let dotsIndicies: number[] = [];
  buffer.forEach((val, idx) => {
    if (idx < buffer.length - 1) {
      if (buffer[idx + 1] - buffer[idx] > DISTANCE_BETWEEN_CELLS) {
        dotsIndicies = dotsIndicies.concat(range(buffer[idx] + 1, buffer[idx + 1] - 1));
      }
    }
  });
  return dotsIndicies;
}

const Snippet: React.FC<Props> = ({ taskId, selectedDependency }) => {
  const [table, setTable] = useState<string[][]>([[]]);
  const selectedIndices: Map<number, string> = getSelectedIndices(
    selectedDependency,
    table[0]
  );

  useEffect(() => {
    axios
      .get(`${serverURL}/getSnippet?taskID=${taskId}`)
      .then((res) => setTable(res.data));
  }, []);

  return (
    <table>
      {
        table === undefined ?
          <></>
          :
          table
            .filter((val, idx) => idx < MAX_LENGTH)
            .map((value, index) => (
              <tr
                // eslint-disable-next-line react/no-array-index-key
                key={index}
              >
                {value
                  .filter((cell, idx) => ((idx !== value.length - 1) || (cell !== "")))
                  .map((cell, idx) => (
                    <td
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      style={selectedIndices.get(idx) !== undefined ? { backgroundColor: `${selectedIndices.get(idx)}90` } : { backgroundColor: "#ffffff" }}
                    >
                      {cell}
                    </td>
                  ))
                  .filter((cell, idx) => (!getDotsIndices(selectedIndices).includes(idx)))}
              </tr>
            ))
      }
    </table>
  );
};

export default Snippet;
