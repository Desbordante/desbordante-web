import React, { useState, useEffect } from "react";
import { Container, Stack } from "react-bootstrap";

import FDSnippet from "./FDSnippet";
import SearchBar from "../../SearchBar/SearchBar";
import Toggle from "../../Toggle/Toggle";
import Selector from "../../Selector/Selector";
import { FDAttribute, FunctionalDependency } from "../../../types/taskInfo";

type SortMethod = "LHS" | "RHS";
const allowedSortMethods: SortMethod[] = ["LHS", "RHS"];

interface Props {
  selectedAttributesLHS: FDAttribute[];
  selectedAttributesRHS: FDAttribute[];
  selectedDependency: FunctionalDependency | null;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<FunctionalDependency | null>
  >;
  dependencies: FunctionalDependency[];
  keys: string[];
  className?: string;
}

const FDList: React.FC<Props> = ({
  selectedAttributesLHS,
  selectedAttributesRHS,
  selectedDependency,
  setSelectedDependency,
  dependencies,
  keys,
  className = "",
}) => {
  const [sortedDependencies, setSortedDependencies] = useState<
    FunctionalDependency[]
  >([]);
  const [sortBy, setSortBy] = useState<SortMethod>("LHS");
  const [searchString, setSearchString] = useState("");
  const [showKeys, setShowKeys] = useState(true);

  // update displayed dependencies on search
  useEffect(() => {
    const dependenciesWithoutKeys =
      (showKeys
        ? dependencies
        : dependencies?.filter(
            (dep) =>
              !keys?.length ||
              keys?.some((key) => dep.lhs.includes(key) || dep.rhs === key)
          )) || [];
    const foundDependencies = (
      searchString
        ? dependenciesWithoutKeys.filter((dep) =>
            dep.lhs
              .concat(dep.rhs)
              .join("")
              .toLowerCase()
              .includes(searchString.toLowerCase())
          )
        : dependenciesWithoutKeys
    )
      // filter by chosen LHS
      .filter((dep) =>
        selectedAttributesLHS.every((attr) =>
          dep.lhs.includes(attr.column.name)
        )
      )
      // filter by chosen RHS
      .filter((dep) =>
        selectedAttributesRHS.every((attr) => dep.rhs === attr.column.name)
      );

    // sort found dependencies
    const newSortedDependencies = foundDependencies.sort((d1, d2) => {
      if (sortBy === "LHS") {
        return (d1.lhs.join("") + d1.rhs).localeCompare(
          d2.lhs.join("") + d2.rhs
        );
      }

      return d1.rhs.localeCompare(d2.rhs);
    });

    setSortedDependencies(newSortedDependencies);
  }, [
    dependencies,
    selectedAttributesLHS,
    selectedAttributesRHS,
    searchString,
    sortBy,
    showKeys,
  ]);

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={allowedSortMethods}
          current={sortBy}
          onSelect={setSortBy}
          label={(sortMethod) => sortMethod}
          variant="dark"
          className="mx-2"
        />
        <SearchBar
          defaultText="Filter dependencies"
          onChange={(str) => setSearchString(str)}
          className="mx-2"
        />
        <Toggle
          toggleCondition={showKeys}
          variant="dark"
          onClick={() => setShowKeys((prevShowKeys) => !prevShowKeys)}
          className="mx-2"
        >
          Show Keys
        </Toggle>
      </Container>
      <Stack className="my-2 w-100">
        {sortedDependencies.map((dep, index) => (
          <FDSnippet
            dependency={dep}
            key={index}
            onClick={() => {
              setSelectedDependency(dep);
            }}
            onActiveClick={() => {
              setSelectedDependency(null);
            }}
            isActive={
              JSON.stringify(dep) === JSON.stringify(selectedDependency)
            }
          />
        ))}
      </Stack>
    </Container>
  );
};

export default FDList;
