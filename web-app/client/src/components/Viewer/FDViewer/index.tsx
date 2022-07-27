import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import FDList from "./FDList";
import Navigation from "../Navigation";
import { TaskContext } from "../../TaskContext";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";
import TableSnippet from "../TableSnippet/TableSnippet";
import Charts from "./Charts";
import { FD } from "../../../graphql/operations/fragments/__generated__/FD";

const tabs = ["Attributes", "Dependencies", "Dataset"];

const Index = () => {
  const { pieChartData } = useContext(TaskContext)!;

  const [partShown, setPartShown] = useState(0);
  const [selectedDependency, setSelectedDependency] =
    useState<FD | null>(null);

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
        <FDList
          selectedDependency={selectedDependency}
          setSelectedDependency={setSelectedDependency}
        />
      )}

      {partShown === 2 && (
        <TableSnippet
          selectedColumns={
            selectedDependency
              ? selectedDependency.lhs.concat(selectedDependency.rhs)
              : []
          }
        />
      )}
    </Container>
  );
};

export default Index;
