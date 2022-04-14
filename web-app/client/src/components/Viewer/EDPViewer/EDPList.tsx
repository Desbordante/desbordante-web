import React, { useContext } from "react";
import { Container, Stack } from "react-bootstrap";

import EDPSnippet from "./EDPSnippet";
import SearchBar from "../../SearchBar/SearchBar";
import Toggle from "../../Toggle/Toggle";
import Selector from "../../Selector/Selector";
import { sortOptions } from "../../../constants/primitives";
import { SortSide } from "../../../types/globalTypes";
import { TaskContext } from "../../TaskContext";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import Pagination from "../Pagination";
import { ClustersContext } from "./ClustersContext";

interface Props {
  className?: string;
}

const FDList: React.FC<Props> = ({ className = "" }) => {
  const { primitiveFilter, setPrimitiveFilter, taskResult, taskResultLoading } =
    useContext(TaskContext)!;
  const { selectedDependency, setSelectedDependency } =
    useContext(ClustersContext)!;

  const dependencies = taskResult?.TypoFD?.TypoFDs || [];

  const setSortMethod = (selected: SortSide) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.FD.sortSide = selected;
      return newFilter;
    });

  const setFilterString = (newFilterString: string) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.FD.filterString = newFilterString;
      return newFilter;
    });

  const toggleWithoutKeys = () =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.FD.withoutKeys = !newFilter.FD.withoutKeys;
      return newFilter;
    });

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
          defaultText="Dependencies regex"
          onChange={setFilterString}
          value={primitiveFilter.FD.filterString || ""}
          className="mx-2"
        />
        <Toggle
          toggleCondition={!primitiveFilter.FD.withoutKeys}
          variant="dark"
          onClick={toggleWithoutKeys}
          className="mx-2"
        >
          Show Keys
        </Toggle>
      </Container>
      <LoadingContainer isLoading={taskResultLoading}>
        <Stack className="my-2">
          {dependencies.map((dep, index) => (
            <EDPSnippet
              dependency={dep}
              key={index}
              onClick={() => {
                setSelectedDependency(dep);
              }}
              onActiveClick={() => {
                setSelectedDependency(undefined);
              }}
              isActive={
                JSON.stringify(dep) === JSON.stringify(selectedDependency)
              }
            />
          ))}
        </Stack>
      </LoadingContainer>
      <Pagination primitiveType="TypoFD" />
    </Container>
  );
};
export default FDList;
