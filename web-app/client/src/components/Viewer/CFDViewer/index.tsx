import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import CFDList from "./CFDList";
import TableSnippet from "../TableSnippet/TableSnippet";
import Navigation from "../Navigation";
import { ConditionalDependency } from "../../../types/taskInfo";
import { TaskContext } from "../../TaskContext";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import Charts from "../FDViewer/Charts";

const tabs = ["Attributes", "Dependencies", "Dataset"];

const Index = () => {
  const { pieChartData } = useContext(TaskContext)!;

  const [partShown, setPartShown] = useState(0);
  const [selectedDependency, setSelectedDependency] =
    useState<ConditionalDependency | null>(null);

  // @ts-ignore
  return (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />

      {partShown === 0 && (
        <LoadingContainer isLoading={!pieChartData}>
          <Charts />
        </LoadingContainer>
      )}

      {partShown === 1 && (
        <CFDList
          selectedDependency={selectedDependency}
          setSelectedDependency={setSelectedDependency}
        />
      )}

      {partShown === 2 && (
        <TableSnippet
          selectedColumns={
            selectedDependency
              ? selectedDependency.lhs
                  .concat(selectedDependency.rhs)
                  .map((name) => ({ name, index: 0, __typename: "Column" }))
              : []
          }
        />
      )}
    </Container>
  );
};

export default Index;
