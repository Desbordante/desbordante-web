/* eslint-disable*/

import React, { useState, useEffect } from "react";
import { Container, Stack } from "react-bootstrap";

import "./DependencyListFull.scss";
import Dependency from "../Dependency/Dependency";
import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";
import { attribute, dependency } from "../../types";

type sortMethod = "LHS" | "RHS";

interface Props {
  dependencies: dependency[];
  selectedAttributesLHS: attribute[];
  selectedAttributesRHS: attribute[];
  selectedDependency: dependency | null;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<dependency | null>
  >;
  className?: string;
}

const DependencyListFull: React.FC<Props> = ({
  dependencies,
  selectedAttributesLHS,
  selectedAttributesRHS,
  selectedDependency,
  setSelectedDependency,
  className = "",
}) => {
  const [sortedDependencies, setSortedDependencies] = useState<dependency[]>(
    []
  );
  const [sortBy, setSortBy] = useState<sortMethod>("LHS");
  const [searchString, setSearchString] = useState("");
  const [showKeys, setShowKeys] = useState(true);
  const allowedSortMethods: sortMethod[] = ["LHS", "RHS"];

  // update displayed dependencies on search
  useEffect(() => {
    const keywords = searchString.split(" ").filter((str) => str);

    const foundDependencies = (
      searchString !== ""
        ? dependencies.filter((dep) =>
            keywords.every(
              (elem) =>
                dep.lhs
                  .map((attr) => attr.name)
                  .some((attr) => attr.includes(elem)) || dep.rhs.name === elem
            )
          )
        : [...dependencies]
    )
      // filter by chosen LHS
      .filter((dep) =>
        selectedAttributesLHS.length > 0
          ? selectedAttributesLHS.some((attr) =>
              dep.lhs.map((attr) => attr.name).includes(attr.name)
            )
          : true
      )
      // filter by chosen RHS
      .filter((dep) =>
        selectedAttributesRHS.length > 0
          ? selectedAttributesRHS.some((attr) => dep.rhs.name === attr.name)
          : true
      );

    // sort found dependencies
    const newSortedDependencies = foundDependencies.sort((d1, d2) => {
      if (sortBy === "LHS") {
        return (d1.lhs.join("") + d1.rhs).localeCompare(
          d2.lhs.join("") + d2.rhs
        );
      }

      return d1.rhs.name.localeCompare(d2.rhs.name);
    });

    setSortedDependencies(newSortedDependencies);
  }, [
    dependencies,
    selectedAttributesLHS,
    selectedAttributesRHS,
    searchString,
    sortBy,
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
          onClick={() => setShowKeys(!showKeys)}
          className="mx-2"
        >
          Show Keys
        </Toggle>
      </Container>
      <Stack className="my-2 w-100">
        {sortedDependencies.map((dep, index) => {
          return (
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
          );
        })}
      </Stack>
    </Container>
  );
};

export default DependencyListFull;
