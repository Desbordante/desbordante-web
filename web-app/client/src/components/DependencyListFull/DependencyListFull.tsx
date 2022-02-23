import React, { useState, useEffect, useContext } from "react";
import { Container, Stack } from "react-bootstrap";

import Dependency from "../Dependency/Dependency";
import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";
import { attribute, dependency } from "../../types/types";
import { TaskContext } from "../TaskContext";

type sortMethod = "LHS" | "RHS";

interface Props {
  selectedAttributesLHS: attribute[];
  selectedAttributesRHS: attribute[];
  selectedDependency: dependency | null;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<dependency | null>
  >;
  className?: string;
}

const DependencyListFull: React.FC<Props> = ({
  selectedAttributesLHS,
  selectedAttributesRHS,
  selectedDependency,
  setSelectedDependency,
  className = "",
}) => {
  const { dependencies, keys } = useContext(TaskContext)!;

  const [sortedDependencies, setSortedDependencies] = useState<dependency[]>(
    []
  );
  const [sortBy, setSortBy] = useState<sortMethod>("LHS");
  const [searchString, setSearchString] = useState("");
  const [showKeys, setShowKeys] = useState(true);
  const allowedSortMethods: sortMethod[] = ["LHS", "RHS"];

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
        {allowedSortMethods.map((value, index) => (
          <Toggle
            onClick={() => setSortBy(value)}
            toggleCondition={sortBy === value}
            variant="dark"
            key={index}
            className="mx-2"
          >
            {value}
          </Toggle>
        ))}
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
          <Dependency
            dep={dep}
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

export default DependencyListFull;
