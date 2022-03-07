/* eslint-disable no-console,indent,function-paren-newline */
import React, { useState, useContext } from "react";
import { Container } from "react-bootstrap";

import Toggle from "../../Toggle/Toggle";
import Table from "./Table";
import { TaskContext } from "../../TaskContext";
import { FunctionalDependency } from "../../../types/taskInfo";

interface Props {
  selectedDependency: FunctionalDependency | null;
  className?: string;
}

const TableSnippet: React.FC<Props> = ({
  selectedDependency,
  className = "",
}) => {
  const { dataset } = useContext(TaskContext)!;
  const { snippet } = dataset!;
  const header =
    snippet && snippet.header
      ? snippet.header.map((elem) => elem || "null")
      : [];
  const rows = snippet && snippet.rows ? snippet.rows : [[]];
  const [isNonSelectedPartShown, setIsNonSelectedPartShown] = useState(true);

  const getSelectedAttributeColumns = () => {
    if (!selectedDependency) {
      return [];
    }
    const lhs = selectedDependency.lhs.map((attr) => header.indexOf(attr));
    const rhs = header.indexOf(selectedDependency.rhs);
    return [...lhs, rhs];
  };

  return (
    <Container fluid className={`flex-grow-1 ${className}`}>
      <Toggle
        variant="dark"
        onClick={() => setIsNonSelectedPartShown(!isNonSelectedPartShown)}
        toggleCondition={isNonSelectedPartShown}
        isEnabled={!!selectedDependency}
        className="my-2"
      >
        Snow non-selected
      </Toggle>
      <Table
        colorizedColumns={getSelectedAttributeColumns()}
        showUncolorizedColumns={isNonSelectedPartShown || !selectedDependency}
        rows={rows}
        header={header}
      />
    </Container>
  );
};

export default TableSnippet;
