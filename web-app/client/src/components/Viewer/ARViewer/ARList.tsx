import React, { useContext } from "react";
import { Container, Stack } from "react-bootstrap";

import SearchBar from "../../SearchBar/SearchBar";
import Selector from "../../Selector/Selector";
import ARSnippet from "./ARSnippet";
import { AssociationRule } from "../../../types/types";
import { TaskContext } from "../../TaskContext";
import { ARSortBy } from "../../../types/globalTypes";
import {ARSortByLabels, sortOptions} from "../../../constants/primitives";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import Pagination from "../Pagination";

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
  const { primitiveFilter, setPrimitiveFilter, taskResult, taskResultLoading } =
    useContext(TaskContext)!;

  const rules = taskResult?.AR?.ARs || [];

  const setSortMethod = (selected: ARSortBy) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.AR.sortBy = selected;
      return newFilter;
    });

  const setFilterString = (newFilterString: string) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.AR.filterString = newFilterString;
      return newFilter;
    });

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={sortOptions.AR}
          current={primitiveFilter.AR.sortBy}
          onSelect={setSortMethod}
          label={(sortMethod) => ARSortByLabels[sortMethod]}
          variant="dark"
          className="mx-2"
        />
        <SearchBar
          value={primitiveFilter.AR.filterString || ""}
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
      <Pagination primitiveType="AR" />
    </Container>
  );
};

export default ARList;
