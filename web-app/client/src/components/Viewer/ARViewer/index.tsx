import React, { useState } from "react";
import { Container } from "react-bootstrap";

import ARList from "./ARList";
import Navigation from "../Navigation";
import ARTableSnippet from "./ARTableSnippet";
import { AR } from "../../../graphql/operations/fragments/__generated__/AR";

const tabs = ["Association Rules", "Dataset"];

const Index = () => {
  const [partShown, setPartShown] = useState(0);
  const [selectedDependency, setDependency] = useState<AR | null>(
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
        <ARList selectedDependency={selectedDependency} setSelectedDependency={setDependency} />
      )}
      {partShown === 1 && (
        <ARTableSnippet
          selectedItems={selectedDependency?.lhs.concat(selectedDependency?.rhs)}
        />
      )}
    </Container>
  );
};

export default Index;
