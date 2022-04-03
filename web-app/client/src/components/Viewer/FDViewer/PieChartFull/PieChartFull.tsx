import React, { useState, useEffect } from "react";

import "./PieChartFull.scss";
import SearchBar from "../../../SearchBar/SearchBar";
import Chart from "./Chart";
import Button from "../../../Button/Button";
import { FDAttribute } from "../../../../types/taskInfo";
import { usePieChart } from "./usePieChart";
import { Column } from "../../../../graphql/operations/fragments/__generated__/Column";

/* eslint-disable no-unused-vars */
interface Props {
  title: string;
  attributes: FDAttribute[];
  maxItemsShown?: number;
  maxItemsSelected?: number;
  selectedAttributeIndices: number[];
  setSelectedAttributeIndices: (n: number[]) => void;
}

/* eslint-enable no-unused-vars */

const PieChartFull: React.FC<Props> = ({
  title,
  attributes,
  maxItemsShown = 9,
  maxItemsSelected = 9,
  selectedAttributeIndices,
  setSelectedAttributeIndices,
}) => {
  const { searchString, setSearchString, displayAttributes, depth, setDepth } =
    usePieChart(attributes, maxItemsShown, selectedAttributeIndices);

  const handleSelect = (_: any, item: Column[]) => {
    if (!item.length) {
      return;
    }
    if (item[0].index === maxItemsShown) {
      setDepth(depth + 1);
    } else if (selectedAttributeIndices.length < maxItemsSelected) {
      setSelectedAttributeIndices(
        selectedAttributeIndices.concat(
          displayAttributes[item[0].index].column.index
        )
      );
    }
  };

  return (
    <div className="pie-chart-full d-flex flex-column align-items-center">
      <h1 className="title fw-bold mb-3">{title}</h1>
      <div className="d-flex align-items-center">
        <SearchBar
          value={searchString}
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
      {displayAttributes && (
        <Chart
          attributes={attributes}
          onSelect={handleSelect}
          displayAttributes={displayAttributes}
          selectedAttributeIndices={selectedAttributeIndices}
          setSelectedAttributeIndices={setSelectedAttributeIndices}
        />
      )}
    </div>
  );
};

export default PieChartFull;
