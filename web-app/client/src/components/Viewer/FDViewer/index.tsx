import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import PieChartFull from "./PieChartFull/PieChartFull";
import FDList from "./FDList";
import TableSnippet from "../TableSnippet/TableSnippet";
import Navigation from "../Navigation";
import {
  Dependency,
  FDAttribute,
  FDTaskResult,
  FunctionalDependency,
  SortMethod,
} from "../../../types/taskInfo";

const tabs = ["Attributes", "Dependencies", "Dataset"];
const sortMethods: SortMethod<Dependency>[] = [
  {
    name: "LHS",
    comparator: (t1, t2) => {
      const str1 = t1.lhs.join("").concat(t1.rhs);
      const str2 = t2.lhs.join("").concat(t2.rhs);
      return str1.localeCompare(str2);
    },
  },
  {
    name: "RHS",
    comparator: (t1, t2) => t1.rhs.localeCompare(t2.rhs),
  },
];

interface Props {
  result: FDTaskResult;
}

const Index: React.FC<Props> = ({ result }) => {
  const [partShown, setPartShown] = useState(0);
  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    FDAttribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    FDAttribute[]
  >([]);
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
        <Row className="w-100 flex-grow-1 justify-content-evenly">
          <Col xl={6} className="mt-5">
            <PieChartFull
              title="Left-hand side"
              attributes={result.pieChartData.lhs}
              selectedAttributes={selectedAttributesLHS}
              setSelectedAttributes={setSelectedAttributesLHS}
            />
          </Col>
          <Col xl={6} className="mt-5">
            <PieChartFull
              title="Right-hand side"
              attributes={result.pieChartData.rhs}
              maxItemsSelected={1}
              selectedAttributes={selectedAttributesRHS}
              setSelectedAttributes={setSelectedAttributesRHS}
            />
          </Col>
        </Row>
      )}

      {partShown === 1 && (
        <FDList
          dependencies={result.FDs}
          sortMethods={sortMethods}
          keys={result.PKs}
          selectedAttributesLHS={selectedAttributesLHS}
          selectedAttributesRHS={selectedAttributesRHS}
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
