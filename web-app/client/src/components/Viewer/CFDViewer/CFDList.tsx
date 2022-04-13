import React, {useState, useEffect, useContext} from "react";
import {Container, Stack} from "react-bootstrap";

import SearchBar from "../../SearchBar/SearchBar";
import Toggle from "../../Toggle/Toggle";
import Selector from "../../Selector/Selector";
import {
  ConditionalDependency,
  FDAttribute,
  SortMethod,
} from "../../../types/taskInfo";
import CFDSnippet from "./CFDSnippet";
import {TaskContext} from "../../TaskContext";
import {sortOptions} from "../../../constants/primitives";
import {SortSide} from "../../../types/globalTypes";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import Pagination from "../Pagination";

interface Props {
  selectedDependency: ConditionalDependency | null;
  setSelectedDependency: React.Dispatch<React.SetStateAction<ConditionalDependency | null>>;
  className?: string;
}

const CFDList: React.FC<Props> = ({
                                    selectedDependency,
                                    setSelectedDependency,
                                    className = "",
                                  }) => {
  const {primitiveFilter, setPrimitiveFilter, taskResult, taskResultLoading} =
    useContext(TaskContext)!;

  const dependencies = taskResult?.CFD?.CFDs || [];

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

  const [isPatternShown, setIsPatternShown] = useState(true);

  // update displayed dependencies on search
  // useEffect(() => {
  //   const dependenciesWithoutKeys =
  //     (showKeys
  //       ? dependencies
  //       : dependencies?.filter(
  //           (dep) =>
  //             !keys?.length ||
  //             keys?.some(
  //               (key) => dep.lhs.includes(key.name) || dep.rhs === key.name
  //             )
  //         )) || [];
  //   const foundDependencies = (
  //     searchString
  //       ? dependenciesWithoutKeys.filter((dep) =>
  //           dep.lhs
  //             .concat(dep.rhs)
  //             .join("")
  //             .toLowerCase()
  //             .includes(searchString.toLowerCase())
  //         )
  //       : dependenciesWithoutKeys
  //   )
  //     // filter by chosen LHS
  //     .filter((dep) =>
  //       selectedAttributesLHS.every((attr) =>
  //         dep.lhs.includes(attr.column.name)
  //       )
  //     )
  //     // filter by chosen RHS
  //     .filter((dep) =>
  //       selectedAttributesRHS.every((attr) => dep.rhs === attr.column.name)
  //     );
  //
  //   // sort found dependencies
  //   const newSortedDependencies = foundDependencies.sort(
  //     currentSortMethod.comparator
  //   );
  //   setSortedDependencies(newSortedDependencies);
  // }, [
  //   dependencies,
  //   selectedAttributesLHS,
  //   selectedAttributesRHS,
  //   searchString,
  //   currentSortMethod,
  //   showKeys,
  // ]);

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
      <Pagination primitiveType="CFD"/>
    </Container>
  );
};

export default CFDList;
