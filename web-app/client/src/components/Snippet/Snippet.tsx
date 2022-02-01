/* eslint-disable no-console,indent,function-paren-newline */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container } from "react-bootstrap";

import "./Snippet.scss";
import { dependency } from "../../types";
import { serverURL } from "../../APIFunctions";
import Table from "./Table";

interface Props {
  taskId: string;
  selectedDependency: dependency | null;
}

const Snippet: React.FC<Props> = ({ taskId, selectedDependency }) => {
  const [table, setTable] = useState<string[][]>([[]]);
  const header = table[0];

  const getSelectedAttributeColumns = () => {
    if (!selectedDependency) {
      return [];
    }
    const lhs = selectedDependency.lhs.map((attr) => header.indexOf(attr.name));
    const rhs = header.indexOf(selectedDependency.rhs.name);
    return [...lhs, rhs];
  };

  const getNonSelectedAttributeColumns = () => {
    const selectedColumns = getSelectedAttributeColumns();
    return header
      .map((_, index) => index)
      .filter((index) => !selectedColumns.includes(index));
  };

  const getSelectedTablePart = () => {
    const selectedColumns = getSelectedAttributeColumns();
    return table.map((row) => selectedColumns.map((column) => row[column]));
  };

  const getNonSelectedTablePart = () => {
    const nonSelectedColumns = getNonSelectedAttributeColumns();
    return table.map((row) => nonSelectedColumns.map((column) => row[column]));
  };

  useEffect(() => {
    axios
      .get(`${serverURL}/getSnippet?taskID=${taskId}`)
      .then((res) => setTable(res.data));
  }, []);

  return (
    <Container className="d-flex">
      {table && selectedDependency && (
        <Table data={getSelectedTablePart()} colorize />
      )}
      {table && <Table data={getNonSelectedTablePart()} />}
    </Container>
  );
};

export default Snippet;
