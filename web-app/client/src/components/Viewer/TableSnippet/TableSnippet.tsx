import React, { useState, useContext } from "react";
import { Container } from "react-bootstrap";

import Toggle from "../../Toggle/Toggle";
import Table from "./Table";
import { TaskContext } from "../../TaskContext";

interface Props {
  selectedColumns: string[];
  className?: string;
}

const TableSnippet: React.FC<Props> = ({ selectedColumns, className = "" }) => {
  const { dataset } = useContext(TaskContext)!;
  const { snippet } = dataset!;
  const header =
    snippet && snippet.header
      ? snippet.header.map((elem) => elem || "null")
      : [];
  const rows = snippet && snippet.rows ? snippet.rows : [[]];
  const [isNonSelectedPartShown, setIsNonSelectedPartShown] = useState(true);

  return (
    <Container fluid className={`flex-grow-1 ${className}`}>
      <Toggle
        variant="dark"
        onClick={() => setIsNonSelectedPartShown(!isNonSelectedPartShown)}
        toggleCondition={isNonSelectedPartShown}
        isEnabled={selectedColumns.length > 0}
        className="my-2"
      >
        Snow non-selected
      </Toggle>
      <Table
        colorizedColumns={selectedColumns}
        showUncolorizedColumns={isNonSelectedPartShown || !selectedColumns}
        rows={rows}
        header={header}
      />
    </Container>
  );
};

export default TableSnippet;
