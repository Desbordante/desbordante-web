import React, { useState, useContext } from "react";
import { Container, Stack } from "react-bootstrap";

import SearchBar from "../../SearchBar/SearchBar";
import Toggle from "../../Toggle/Toggle";
import Selector from "../../Selector/Selector";
import { ConditionalDependency } from "../../../types/taskInfo";
import CFDSnippet from "./CFDSnippet";
import { TaskContext } from "../../TaskContext";
import {CFDSortByLabels, sortOptions} from "../../../constants/primitives";
import { CFDSortBy } from "../../../types/globalTypes";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import Pagination from "../Pagination";

interface Props {
  selectedDependency: ConditionalDependency | null;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<ConditionalDependency | null>
  >;
  className?: string;
}

const CFDList: React.FC<Props> = ({
  selectedDependency,
  setSelectedDependency,
  className = "",
}) => {
  const { primitiveFilter, setPrimitiveFilter, taskResult, taskResultLoading } =
    useContext(TaskContext)!;
  const [isPatternShown, setIsPatternShown] = useState(true);

  const dependencies = taskResult?.CFD?.CFDs || [];

  const setSortMethod = (selected: CFDSortBy) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.CFD.sortBy = selected;
      return newFilter;
    });

  const setFilterString = (newFilterString: string) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.CFD.filterString = newFilterString;
      return newFilter;
    });

  const toggleWithoutKeys = () =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.CFD.withoutKeys = !newFilter.CFD.withoutKeys;
      return newFilter;
    });

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={sortOptions.CFD.filter((option) => option in CFDSortByLabels)}
          current={primitiveFilter.CFD.sortBy}
          onSelect={setSortMethod}
          // @ts-ignore
          label={(sortMethod) => CFDSortByLabels[sortMethod]}
          variant="dark"
          className="mx-2"
        />
        <SearchBar
          defaultText="Dependencies regex"
          onChange={setFilterString}
          value={primitiveFilter.CFD.filterString || ""}
          className="mx-2"
        />
        <Toggle
          toggleCondition={!primitiveFilter.CFD.withoutKeys}
          variant="dark"
          onClick={toggleWithoutKeys}
          className="mx-2"
        >
          Show Keys
        </Toggle>
        <Toggle
          toggleCondition={isPatternShown}
          variant="dark"
          onClick={() => setIsPatternShown((prev) => !prev)}
          className="mx-2"
        >
          Show Patterns
        </Toggle>
      </Container>
      <LoadingContainer isLoading={taskResultLoading}>
        <Stack className="my-2">
          {dependencies.map((dep, index) => (
            <CFDSnippet
              dependency={dep}
              key={index}
              isPatternShown={isPatternShown}
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
      </LoadingContainer>
      <Pagination primitiveType="CFD" />
    </Container>
  );
};

export default CFDList;
