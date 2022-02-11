import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

import "./Viewer.scss";
import PieChartFull from "../PieChartFull/PieChartFull";
import DependencyListFull from "../DependencyListFull/DependencyListFull";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import ProgressBar from "../ProgressBar/ProgressBar";
import Phasename from "../Phasename/Phasename";
import { attribute, dependency } from "../../types";
import { TaskContext } from "../TaskContext/TaskContext";
import Snippet from "../Snippet/Snippet";
import Navigation from "./Navigation";

const Viewer = () => {
  const { taskID } = useParams();

  const { setTaskId, isExecuted, progress, pieChartData, dependencies } =
    useContext(TaskContext)!;
  setTaskId(taskID!);

  const [partShown, setPartShown] = useState(0);
  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    attribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    attribute[]
  >([]);

  const [selectedDependency, setSelectedDependency] =
    useState<dependency | null>(null);

  return (
    <>
      <div className="top-bar">
        <ProgressBar progress={progress} maxWidth={100} thickness={0.3} />
        <Phasename />
      </div>
      {isExecuted ? (
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
                attributes={pieChartData?.lhs}
                selectedAttributes={selectedAttributesLHS}
                setSelectedAttributes={setSelectedAttributesLHS}
              />
            </Col>
            <Col xl={6} className="mt-5">
              <PieChartFull
                title="Right-hand side"
                attributes={pieChartData?.rhs}
                maxItemsSelected={1}
                selectedAttributes={selectedAttributesRHS}
                setSelectedAttributes={setSelectedAttributesRHS}
              />
            </Col>
          </Row>

          {dependencies && (
            <DependencyListFull
              dependencies={dependencies}
              selectedAttributesLHS={selectedAttributesLHS}
              selectedAttributesRHS={selectedAttributesRHS}
              selectedDependency={selectedDependency}
              setSelectedDependency={setSelectedDependency}
              className={partShown === 1 ? "" : "d-none"}
            />
          )}

          <Snippet
            selectedDependency={selectedDependency}
            className={partShown === 2 ? "" : "d-none"}
          />
        </Container>
      ) : (
        <StatusDisplay text="Loading" />
      )}
    </>
  );
};

export default Viewer;
