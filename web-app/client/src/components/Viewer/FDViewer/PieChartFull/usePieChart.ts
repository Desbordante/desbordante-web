import { useEffect, useState } from "react";
import { FDAttribute } from "../../../../types/taskInfo";

export const usePieChart = (
  attributes: FDAttribute[],
  maxItemsShown: number,
  selectedAttributeIndices: number[]
) => {
  const [searchString, setSearchString] = useState("");
  const [depth, setDepth] = useState(0);
  const [displayAttributes, setDisplayAttributes] = useState<FDAttribute[]>([]);

  useEffect(() => {
    const foundAttributes = attributes
      .filter((attr) => attr.column.name.includes(searchString))
      .filter((attr) => !selectedAttributeIndices.includes(attr.column.index))
      .sort((a, b) => b.value - a.value);

    const newDisplayAttributes = foundAttributes.slice(
      maxItemsShown * depth,
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
          __typename: "Column",
        },
        value: newOtherValue,
        __typename: "FDPieChartRow",
      });
    }

    while (newDisplayAttributes.length <= maxItemsShown) {
      newDisplayAttributes.push({
        column: {
          name: "",
          index: -1,
          __typename: "Column",
        },
        value: 0,
        __typename: "FDPieChartRow",
      });
    }

    setDisplayAttributes(newDisplayAttributes);
  }, [
    searchString,
    depth,
    attributes.length,
    // maxItemsShown,
    selectedAttributeIndices,
  ]);

  return {
    searchString,
    setSearchString,
    displayAttributes,
    depth,
    setDepth,
  };
};
