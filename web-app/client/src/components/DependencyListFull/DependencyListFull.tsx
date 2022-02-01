/* eslint-disable*/

import React, { useState, useEffect } from "react";
import { Container, Stack, Row, Col } from "react-bootstrap";

import "./DependencyListFull.scss";
import Dependency from "../Dependency/Dependency";
import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";
import Snippet from "../Snippet/Snippet";
import { attribute, dependency } from "../../types";

type sortMethod = "LHS" | "RHS";

interface Props {
  dependencies: dependency[];
  selectedAttributesLHS: attribute[];
  selectedAttributesRHS: attribute[];
  file: File | null;
  taskId: string;
  showKeys: boolean;
  setShowKeys: (b: boolean) => void;
}

const DependencyListFull: React.FC<Props> = ({
  dependencies,
  selectedAttributesLHS,
  selectedAttributesRHS,
  taskId,
  showKeys,
  setShowKeys,
}) => {
  const [showDependencies, setShowDependencies] = useState(true);
  const [showDataset, setShowDataset] = useState(false);
  const [sortedDependencies, setSortedDependencies] = useState<dependency[]>(
    []
  );
  const [chosenDependencyIndex, setChosenDependencyIndex] = useState(-1);
  const [sortBy, setSortBy] = useState<sortMethod>("LHS");
  const [searchString, setSearchString] = useState("");
  const allowedSortMethods: sortMethod[] = ["LHS", "RHS"];
  const [
    selectedDependency,
    setSelectedDependency,
  ] = useState<dependency | null>(null);
  // update displayed dependencies on search
  useEffect(() => {
    const keywords = searchString.split(" ").filter((str) => str);

    const foundDependencies = (searchString !== ""
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
    <Container fluid className="p-4 flex-grow-1 d-flex flex-column">
      <Row>
        <Col className="col-auto d-flex flex-wrap align-items-center my-2 px-0">
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
        </Col>
        <Col className="col-auto d-flex flex-wrap align-items-center my-2 px-0">
          <h3 className="mx-2 fw-bold">Display</h3>
          <Toggle
            toggleCondition={showKeys}
            variant="dark"
            onClick={() => setShowKeys(!showKeys)}
            className="mx-2"
          >
            Keys
          </Toggle>
          <Toggle
            toggleCondition={showDependencies}
            variant="dark"
            onClick={() => setShowDependencies(!showDependencies)}
            className="mx-2"
          >
            Dependencies
          </Toggle>
          <Toggle
            toggleCondition={showDataset}
            variant="dark"
            onClick={() => setShowDataset(!showDataset)}
            className="mx-2"
          >
            Dataset
          </Toggle>
        </Col>
      </Row>
      <Row className="flex-grow-1">
        <Col className={`col-auto ${showDependencies ? "" : "d-none"}`}>
          <Stack className="my-2 w-100">
            {sortedDependencies.map((dep, index) => {
              return (
                <Dependency
                  dep={dep}
                  key={index}
                  onClick={() => {
                    setChosenDependencyIndex(index);
                    setSelectedDependency(dep);
                  }}
                  onActiveClick={() => {
                    setChosenDependencyIndex(-1);
                    setSelectedDependency(null);
                  }}
                  isActive={index == chosenDependencyIndex}
                />
              );
            })}
          </Stack>
        </Col>
        <Col className={`col-auto ${showDataset ? "" : "d-none"}`}>
          <Snippet taskId={taskId} selectedDependency={selectedDependency} />
        </Col>
      </Row>
    </Container>
  );
};

export default DependencyListFull;
