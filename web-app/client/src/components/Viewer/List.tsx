import React, { useContext } from "react";
import { Container } from "react-bootstrap";

import SearchBar from "../SearchBar/SearchBar";
import Toggle from "../Toggle/Toggle";
import Selector from "../Selector/Selector";
import {
  getDefaultFilterParams,
  getSpecificSortByLabels,
  SortByLabelsType,
  sortOptions
} from "../../constants/primitives";
import { MainPrimitiveType, OrderBy } from "../../types/globalTypes";
import { TaskContext } from "../TaskContext";
import LoadingContainer from "../LoadingContainer/LoadingContainer";
import Pagination from "./Pagination";
import { FilteredDeps, UnionFilteredSpecificDeps } from "../../types/primitives";
import { TaskResult } from "../../types/taskInfo";

type WithPatternsButtonProps = {
  isPatternShown: boolean;
  setIsPatternShown: React.Dispatch<
    React.SetStateAction<boolean>
    >;
}

export interface SpecificListProps<T> {
  selectedDependency: T | null;
  setSelectedDependency: React.Dispatch<
    React.SetStateAction<T | null>
    >;
  className?: string;
}

interface Props {
  className?: string;
  type: MainPrimitiveType.FD | MainPrimitiveType.CFD | MainPrimitiveType.AR,
  withOrderBy?: boolean,
  withWithoutKeys?:boolean,
  patternButtonProps?:WithPatternsButtonProps,
}

const getDeps = <T extends keyof UnionFilteredSpecificDeps>
// @ts-ignore
(filteredDeps: FilteredDeps, key: T): UnionFilteredSpecificDeps[T] => filteredDeps[key];

export const pluralize = <WordType extends string, SuffixType extends string>(
  word: WordType, suffix: SuffixType) => `${word}${suffix}` as const;

export const pluralizeDep = <DepType extends MainPrimitiveType>(word: DepType) =>
  pluralize(`${word}`, "s");

export const getDepsFromTaskResult =
  <K extends keyof UnionFilteredSpecificDeps>(
    taskResult: TaskResult | undefined, key: K) => {
  if (taskResult?.filteredDeps == null) {
    throw Error("Field 'filteredDeps' is undefined");
  }
  const { filteredDeps } = taskResult;
  return getDeps(filteredDeps, key);
}

const List: React.FC<React.PropsWithChildren<Props>> = ({
  type,
                                                          children, patternButtonProps=undefined,
                                                        withOrderBy=true,
  withWithoutKeys=false,
                                                          className = ""
                                 }) => {
  const {intersectionFilter, setIntersectionFilter, setFilterParams, taskResult, taskResultLoading} =
    useContext(TaskContext)!;

  const expectedFilteredDepsTypeName = `Filtered${type}s` as const;
  const sortByParamName = `${type}SortBy` as const;

  if (taskResult?.filteredDeps?.__typename !== expectedFilteredDepsTypeName) {
    throw Error(`Unexpected typename ${taskResult?.filteredDeps?.__typename}, ` +
      `Expected ${expectedFilteredDepsTypeName}`);
  }
  if (intersectionFilter[sortByParamName] == null) {
    setFilterParams({[sortByParamName]: getDefaultFilterParams(type)[sortByParamName] });
  }

  const labels = getSpecificSortByLabels(type);
  const options = sortOptions[type] as SortByLabels[];
  const sortBy = intersectionFilter[sortByParamName];
  type SortByLabels = SortByLabelsType<typeof type>;

  const setSortMethod = (sort: SortByLabels) =>
    setFilterParams({ [sortByParamName]: sort });

  const setFilterString = (filterString: string) => setFilterParams({filterString});

  const toggleWithoutKeys = () =>
    setIntersectionFilter((filter) => ({
      ...filter,
      withoutKeys: !filter.withoutKeys,
    }));

  const toggleOrderBy = () =>
    setIntersectionFilter((filter) => ({
      ...filter,
      orderBy: (filter.orderBy === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC),
    }));

  return (
    <Container fluid className={`flex-grow-1 d-flex flex-column ${className}`}>
      <Container fluid className="d-flex flex-wrap align-items-center p-0 my-2">
        <h3 className="mx-2 fw-bold">Sort by</h3>
        <Selector
          options={options.filter((option: SortByLabels) => option in labels)}
          current={sortBy as SortByLabels}
          onSelect={setSortMethod}
          label={(sortMethod) => sortMethod}
          variant="dark"
          className="mx-2"
        />
        {withOrderBy && <Toggle
          toggleCondition={true}
          variant="dark"
          onClick={toggleOrderBy}
          className="mx-2"
        >
          {intersectionFilter.orderBy}
        </Toggle>}
        <SearchBar
          defaultText="Dependencies regex"
          onChange={setFilterString}
          value={intersectionFilter.filterString || ""}
          className="mx-2"
        />
        {withWithoutKeys && <Toggle
          toggleCondition={!intersectionFilter.withoutKeys}
          variant="dark"
          onClick={toggleWithoutKeys}
          className="mx-2"
        >
          Show Keys
        </Toggle>}
        {patternButtonProps && <Toggle
            toggleCondition={patternButtonProps.isPatternShown}
            variant="dark"
            onClick={() => patternButtonProps.setIsPatternShown((prev) => !prev)}
            className="mx-2"
        >
            Show Patterns
        </Toggle>}
      </Container>
      <LoadingContainer isLoading={taskResultLoading}>
        <>
          {children}
        </>
      </LoadingContainer>
      <Pagination/>
    </Container>
  );
};
export default List;
