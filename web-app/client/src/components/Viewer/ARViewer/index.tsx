import React, { useState } from "react";
import { Container } from "react-bootstrap";

import ARList from "./ARList";
import Navigation from "../Navigation";
import { AssociationRule } from "../../../types/types";
import TableSnippet from "../TableSnippet/TableSnippet";

const tabs = ["Association Rules", "Dataset"];

const Index = () => {
  const [partShown, setPartShown] = useState(0);
  const [selectedRule, setSelectedRule] = useState<AssociationRule | null>(
    null
  );

  return (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />
      {partShown === 0 && (
        <ARList selectedRule={selectedRule} setSelectedRule={setSelectedRule} />
      )}
      {partShown === 1 && <TableSnippet selectedColumns={[]} />}
    </Container>
  );
};

export default Index;
