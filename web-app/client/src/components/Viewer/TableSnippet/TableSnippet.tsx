import React, { useState, useContext } from "react";
import { Container } from "react-bootstrap";

import Toggle from "../../Toggle/Toggle";
import Table from "./Table";
import { TaskContext } from "../../TaskContext";
import { Column } from "../../../graphql/operations/fragments/__generated__/Column";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";

interface Props {
  selectedColumns?: Column[];
  className?: string;
}

const TableSnippet: React.FC<Props> = ({
  selectedColumns = [],
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
          isEnabled={selectedColumns.length > 0}
          className="my-2"
        >
          Snow non-selected
        </Toggle>
        <Table
          data={snippet!}
          colorizedColumns={selectedColumns.map(({ name }) => name)}
          showUncolorizedColumns={isNonSelectedPartShown || !selectedColumns}
        />
      </Container>
    </LoadingContainer>
  );
};

export default TableSnippet;
