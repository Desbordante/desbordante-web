import React, { useState, useContext } from "react";
import { Container } from "react-bootstrap";

import Toggle from "../../Toggle/Toggle";
import ARTable from "./ARTable";
import { TaskContext } from "../../TaskContext";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";

interface Props {
  selectedItems?: string[];
  className?: string;
}

const ARTableSnippet: React.FC<Props> = ({
  selectedItems = [],
  className = "",
}) => {
  const { datasetLoading, dataset } = useContext(TaskContext)!;
  const [isNonSelectedPartShown, setIsNonSelectedPartShown] = useState(true);

  const snippet = dataset?.snippet;
  const switchSelectedPart = () => setIsNonSelectedPartShown((prev) => !prev);

  return (
    <LoadingContainer isLoading={datasetLoading}>
      <Container fluid className={`flex-grow-1 ${className}`}>
        <Toggle
          variant="dark"
          onClick={switchSelectedPart}
          toggleCondition={isNonSelectedPartShown}
          isEnabled={selectedItems.length > 0}
          className="my-2"
        >
          Snow non-selected
        </Toggle>
        <ARTable
          data={snippet!}
          colorizedItems={selectedItems}
          showUncolorizedColumns={isNonSelectedPartShown || !selectedItems}
        />
      </Container>
    </LoadingContainer>
  );
};

export default ARTableSnippet;
