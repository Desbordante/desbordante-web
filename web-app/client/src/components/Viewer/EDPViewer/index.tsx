import React, { useContext, useState } from "react";
import { Container } from "react-bootstrap";

import EDPList from "./EDPList";
import Navigation from "../Navigation";
import { TaskContext } from "../../TaskContext";
import TableSnippet from "../TableSnippet/TableSnippet";
import EDPClusters from "./EDPClusters";
import { ClustersContext } from "./ClustersContext";

const tabs = ["Dependencies", "Clusters", "Dataset"];

const Index = () => {
  const { selectedDependency } = useContext(ClustersContext)!;

  const [partShown, setPartShown] = useState(0);

  return (
    <Container
      fluid
      className="h-100 p-4 flex-grow-1 d-flex flex-column align-items-start"
    >
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />

      {partShown === 0 && <EDPList />}

      {partShown === 1 && selectedDependency && <EDPClusters />}

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
