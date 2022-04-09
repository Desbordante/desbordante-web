import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import EDPList from "./EDPList";
import Navigation from "../Navigation";
import { FunctionalDependency } from "../../../types/taskInfo";
import { TaskContext } from "../../TaskContext";
import TableSnippet from "../TableSnippet/TableSnippet";

const tabs = ["Dependencies", "Violations"];

const Index = () => {
  const { pieChartData } = useContext(TaskContext)!;

  const [partShown, setPartShown] = useState(0);
  const [selectedDependency, setSelectedDependency] =
    useState<FunctionalDependency | null>(null);

  return (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />

      {partShown === 0 && (
        <EDPList
          selectedDependency={selectedDependency}
          setSelectedDependency={setSelectedDependency}
        />
      )}

      {partShown === 1 && (
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
