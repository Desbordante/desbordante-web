import React, { useState, useEffect } from "react";

import "./PieChartFull.scss";
import SearchBar from "../SearchBar/SearchBar";
import Chart from "./Chart";
import Button from "../Button/Button";
import { attribute } from "../../types";
import {
  taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs,
  taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs,
} from "../../operations/queries/__generated__/taskInfo";

/* eslint-disable no-unused-vars */
interface Props {
  title: string;
  attributes?:
    | taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs[];
  maxItemsShown?: number;
  maxItemsSelected?: number;
  selectedAttributes: attribute[];
  setSelectedAttributes: (arr: attribute[]) => void;
}
/* eslint-enable no-unused-vars */

const PieChartFull: React.FC<Props> = ({
  title,
  attributes = [],
  maxItemsShown = 9,
  maxItemsSelected = 9,
  selectedAttributes = [],
  setSelectedAttributes,
}) => {
  const [searchString, setSearchString] = useState("");
  const [foundAttributes, setFoundAttributes] = useState<attribute[]>([]);
  const [depth, setDepth] = useState(0);
  const [displayAttributes, setDisplayAttributes] = useState<attribute[]>([]);

  // Update found attributes if search string changes or attributes change.
  // Keep found attributes sorted.
  useEffect(() => {
    const newFoundAttributes = searchString
      ? attributes.filter((attr) => attr.column.name.includes(searchString))
      : attributes;

    setFoundAttributes(
      newFoundAttributes
        .filter((attr) => !selectedAttributes.includes(attr))
        /* eslint-disable-next-line comma-dangle */
        .sort((a, b) => b.value - a.value)
    );
  }, [attributes, searchString, selectedAttributes]);

  // Set DisplayAttributes to top-{maxItemsShown} of found attributes.
  // Add the "Other" value, if needed.
  useEffect(() => {
    const newDisplayAttributes = foundAttributes.slice(
      maxItemsShown * depth,
      /* eslint-disable-next-line comma-dangle */
      maxItemsShown * (depth + 1)
    );

    const newOtherValue = foundAttributes
      .slice(maxItemsShown * (depth + 1))
      .reduce((sum, attr) => sum + attr.value, 0);

    if (foundAttributes.length > maxItemsShown * (depth + 1)) {
      newDisplayAttributes.push({
        column: {
          name: "Other",
          index: -1,
        },
        value: newOtherValue,
      });
    }

    while (newDisplayAttributes.length < maxItemsShown + 1) {
      newDisplayAttributes.push({
        column: {
          name: "",
          index: -1,
        },
        value: 0,
      });
    }

    setDisplayAttributes(newDisplayAttributes);
  }, [foundAttributes, depth, maxItemsShown]);

  return (
    <div className="pie-chart-full d-flex flex-column align-items-center">
      <h1 className="title fw-bold mb-3">{title}</h1>
      <div className="d-flex align-items-center">
        <SearchBar
          defaultText="Filter attributes..."
          onChange={setSearchString}
          className="mx-2"
        />
        <Button
          variant="dark"
          onClick={() => setDepth(depth - 1)}
          enabled={depth > 0}
          className="mx-2"
        >
          <i className="bi bi-layer-forward" />
        </Button>
      </div>
      {selectedAttributes && displayAttributes && (
        <Chart
          onSelect={(_, item) => {
            if (!item.length) {
              return;
            }
            if (item[0].index === maxItemsShown) {
              setDepth(depth + 1);
            } else if (selectedAttributes.length < maxItemsSelected) {
              setSelectedAttributes(
                selectedAttributes.concat(displayAttributes[item[0].index])
              );
            }
          }}
          displayAttributes={
            displayAttributes as
              | taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs[]
              | taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs[]
          }
          selectedAttributes={
            selectedAttributes as
              | taskInfo_taskInfo_data_FDTask_result_pieChartData_rhs[]
              | taskInfo_taskInfo_data_FDTask_result_pieChartData_lhs[]
              | undefined
          }
          setSelectedAttributes={setSelectedAttributes}
        />
      )}
    </div>
  );
};

export default PieChartFull;
