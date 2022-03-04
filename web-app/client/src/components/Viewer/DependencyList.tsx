import React, { useState, useEffect } from "react";
import { Container, Stack } from "react-bootstrap";

import FDSnippet from "./FDViewer/FDSnippet";
import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";
import Selector from "../Selector/Selector";
import { Dependency, FDAttribute, SortMethod } from "../../types/taskInfo";

interface Props {
  selectedAttributesLHS: FDAttribute[];
  selectedAttributesRHS: FDAttribute[];
  selectedDependency: Dependency | null;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<Dependency | null>
  >;
  dependencies: Dependency[];
  sortMethods: SortMethod<Dependency>[];
  keys: string[];
  className?: string;
}

const DependencyList: React.FC<Props> = ({
  selectedAttributesLHS,
  selectedAttributesRHS,
  selectedDependency,
  setSelectedDependency,
  dependencies,
  sortMethods,
  keys,
  className = "",
}) => {
  const [sortedDependencies, setSortedDependencies] = useState<Dependency[]>(
    []
  );
  const [currentSortMethod, setCurrentSortMethod] = useState<
    SortMethod<Dependency>
  >(sortMethods[0]);
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
    const newSortedDependencies = foundDependencies.sort(
      currentSortMethod.comparator
    );
    setSortedDependencies(newSortedDependencies);
  }, [
    dependencies,
    selectedAttributesLHS,
    selectedAttributesRHS,
    searchString,
    currentSortMethod,
    showKeys,
  ]);

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={sortMethods}
          current={currentSortMethod}
          onSelect={setCurrentSortMethod}
          label={(sortMethod) => sortMethod.name}
          variant="dark"
          className="mx-2"
        />
        <SearchBar
          defaultText="Filter dependencies"
          onChange={setSearchString}
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

export default DependencyList;
