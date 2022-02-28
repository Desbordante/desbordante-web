import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

import PieChartFull from "../PieChartFull/PieChartFull";
import DependencyListFull from "../DependencyListFull/DependencyListFull";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import { Attribute, Dependency } from "../../types/types";
import { TaskContext } from "../TaskContext";
import Snippet from "../Snippet/Snippet";
import Navigation from "./Navigation";

const Viewer = () => {
  const { taskID } = useParams();

  const { setTaskId, isExecuted, pieChartData } = useContext(TaskContext)!;

  useEffect(() => setTaskId(taskID), []);

  const [partShown, setPartShown] = useState(0);
  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    Attribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    Attribute[]
  >([]);

  const [selectedDependency, setSelectedDependency] =
    useState<Dependency | null>(null);

  return isExecuted ? (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation partShown={partShown} setPartShown={setPartShown} />
      {partShown === 0 && (
        <Row className="w-100 flex-grow-1 justify-content-evenly">
          <Col xl={6} className="mt-5">
            <PieChartFull
              title="Left-hand side"
              attributes={pieChartData ? pieChartData.lhs : []}
              selectedAttributes={selectedAttributesLHS}
              setSelectedAttributes={setSelectedAttributesLHS}
            />
          </Col>
          <Col xl={6} className="mt-5">
            <PieChartFull
              title="Right-hand side"
              attributes={pieChartData ? pieChartData.rhs : []}
              maxItemsSelected={1}
              selectedAttributes={selectedAttributesRHS}
              setSelectedAttributes={setSelectedAttributesRHS}
            />
          </Col>
        </Row>
      )}

      {partShown === 1 && (
        <DependencyListFull
          selectedAttributesLHS={selectedAttributesLHS}
          selectedAttributesRHS={selectedAttributesRHS}
          selectedDependency={selectedDependency}
          setSelectedDependency={setSelectedDependency}
        />
      )}

      {partShown === 2 && <Snippet selectedDependency={selectedDependency} />}
    </Container>
  ) : (
    <StatusDisplay text="Loading" />
  );
};

export default Viewer;
