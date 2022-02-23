import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

import PieChartFull from "../PieChartFull/PieChartFull";
import DependencyListFull from "../DependencyListFull/DependencyListFull";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import { attribute, dependency } from "../../types/types";
import { TaskContext } from "../TaskContext";
import Snippet from "../Snippet/Snippet";
import Navigation from "./Navigation";

const Viewer = () => {
  const { taskID } = useParams();

  const { setTaskId, isExecuted, pieChartData } = useContext(TaskContext)!;

  useEffect(() => setTaskId(taskID), []);

  const [partShown, setPartShown] = useState(0);
  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    attribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    attribute[]
  >([]);

  const [selectedDependency, setSelectedDependency] =
    useState<dependency | null>(null);

  return isExecuted ? (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation partShown={partShown} setPartShown={setPartShown} />
      <Row
        className={`w-100 flex-grow-1 justify-content-evenly ${
          partShown === 0 ? "" : "d-none"
        }`}
      >
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

      <DependencyListFull
        selectedAttributesLHS={selectedAttributesLHS}
        selectedAttributesRHS={selectedAttributesRHS}
        selectedDependency={selectedDependency}
        setSelectedDependency={setSelectedDependency}
        className={partShown === 1 ? "" : "d-none"}
      />

      <Snippet
        selectedDependency={selectedDependency}
        className={partShown === 2 ? "" : "d-none"}
      />
    </Container>
  ) : (
    <StatusDisplay text="Loading" />
  );
};

export default Viewer;
