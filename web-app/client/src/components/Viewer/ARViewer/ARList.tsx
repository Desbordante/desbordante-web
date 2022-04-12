import React, {useState, useEffect, useContext} from "react";
import {Container, Stack} from "react-bootstrap";

import SearchBar from "../../SearchBar/SearchBar";
import Selector from "../../Selector/Selector";
import {SortMethod} from "../../../types/taskInfo";
import ARSnippet from "./ARSnippet";
import {AssociationRule} from "../../../types/types";
import {TaskContext} from "../../TaskContext";
import {SortSide} from "../../../types/globalTypes";
import {sortOptions} from "../../../constants/primitives";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";

interface Props {
  selectedRule: AssociationRule | null;
  setSelectedRule: React.Dispatch<React.SetStateAction<AssociationRule | null>>;
  className?: string;
}

const ARList: React.FC<Props> = ({
                                   selectedRule,
                                   setSelectedRule,
                                   className = "",
                                 }) => {
  const {primitiveFilter, setPrimitiveFilter, taskResult, taskResultLoading} =
    useContext(TaskContext)!;

  const rules = taskResult?.AR?.ARs || [];

  const setSortMethod = (selected: SortSide) =>
    setPrimitiveFilter((prev) => {
      const newFilter = {...prev};
      newFilter.FD.sortSide = selected;
      return newFilter;
    });

  const setFilterString = (newFilterString: string) =>
    setPrimitiveFilter((prev) => {
      const newFilter = {...prev};
      newFilter.FD.filterString = newFilterString;
      return newFilter;
    });

  const toggleWithoutKeys = () =>
    setPrimitiveFilter((prev) => {
      const newFilter = {...prev};
      newFilter.FD.withoutKeys = !newFilter.FD.withoutKeys;
      return newFilter;
    });

  // update displayed rules on search
  // useEffect(() => {
  //   const foundRules = searchString
  //     ? rules.filter((rule) =>
  //         rule.lhs
  //           .concat(rule.rhs)
  //           .join("")
  //           .toLowerCase()
  //           .includes(searchString.toLowerCase())
  //       )
  //     : [...rules];
  //
  //   // sort found dependencies
  //   const newSortedRules = foundRules.sort(currentSortMethod.comparator);
  //   setSortedRules(newSortedRules);
  // }, [rules, searchString, currentSortMethod]);

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={sortOptions.FD}
          current={primitiveFilter.FD.sortSide}
          onSelect={setSortMethod}
          label={(sortMethod) => sortMethod}
          variant="dark"
          className="mx-2"
        />
        <SearchBar
          value={primitiveFilter.FD.filterString || ""}
          defaultText="Dependencies regex"
          onChange={setFilterString}
          className="mx-2"
        />
      </Container>
      <LoadingContainer isLoading={taskResultLoading}>
        <Stack className="my-2 w-100">
          {rules.map((rule, index) => (
            <ARSnippet
              rule={rule}
              key={index}
              onActiveClick={() => {
                setSelectedRule(null);
              }}
              onClick={() => setSelectedRule(rule)}
              isActive={JSON.stringify(rule) === JSON.stringify(selectedRule)}
            />
          ))}
        </Stack>
      </LoadingContainer>
    </Container>
  );
};

export default ARList;
