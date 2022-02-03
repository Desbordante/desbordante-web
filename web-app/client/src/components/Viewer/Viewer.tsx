/* eslint-disable */

import React, { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  useParams,
  useHistory,
} from "react-router-dom";
import axios from "axios";
import { Col, Container, Row } from "react-bootstrap";

import "./Viewer.scss";
import Toggle from "../Toggle/Toggle";
import PieChartFull from "../PieChartFull/PieChartFull";
import DependencyListFull from "../DependencyListFull/DependencyListFull";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import Button from "../Button/Button";
import ProgressBar from "../ProgressBar/ProgressBar";
import Phasename from "../Phasename/Phasename";
import { serverURL } from "../../APIFunctions";
import {
  taskStatus,
  attribute,
  dependency,
  dependencyEncoded,
} from "../../types";
import { TaskContext } from "../TaskContext/TaskContext";
import Snippet from "../Snippet/Snippet";

const Viewer = () => {
  const { taskID } = useParams<{ taskID: string }>();
  const history = useHistory();

  const {
    setTaskId,
    taskProgress,
    setTaskProgress,
    currentPhase,
    setCurrentPhase,
    phaseName,
    setPhaseName,
    maxPhase,
    setMaxPhase,
    taskStatus,
    setTaskStatus,
    file,
    setFileName,
    setTable,
  } = useContext(TaskContext)!;
  setTaskId(taskID);

  const [partShown, setPartShown] = useState(0);
  const [attributesLHS, setAttributesLHS] = useState<attribute[]>([]);
  const [attributesRHS, setAttributesRHS] = useState<attribute[]>([]);

  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    attribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    attribute[]
  >([]);

  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [
    selectedDependency,
    setSelectedDependency,
  ] = useState<dependency | null>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const [showKeys, setShowKeys] = useState(true);

  const taskFinished = (status: taskStatus) =>
    status === "COMPLETED" || status === "SERVER ERROR";

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`${serverURL}/getTaskInfo?taskID=${taskID}`, { timeout: 2000 })
        .then((task) => task.data)
        .then((data) => {
          setFileName(data.filename);
          setTaskProgress(data.progress / 100);
          setPhaseName(data.phasename);
          setCurrentPhase(data.currentphase);
          setMaxPhase(data.maxphase);
          setTaskStatus(data.status);
          if (taskFinished(data.status)) {
            axios
              .get(`${serverURL}/getSnippet?taskID=${taskID}`)
              .then((res) => setTable(res.data));
            setKeys(
              data.pkcolumnpositions.map(
                (pos: number) => data.arraynamevalue.lhs[pos].name
              )
            );
            setAttributesLHS(data.arraynamevalue.lhs);
            setAttributesRHS(data.arraynamevalue.rhs);
            setDependencies(
              data.fds.map((dep: dependencyEncoded) => ({
                lhs: dep.lhs.map(
                  (attrNum) =>
                    data.arraynamevalue.lhs[attrNum] ||
                    data.arraynamevalue.lhs[0]
                ),
                rhs:
                  data.arraynamevalue.rhs[dep.rhs] ||
                  data.arraynamevalue.rhs[0],
              }))
            );
          }
        })
        .catch((error) => {
          console.error(error);
          history.push("/error");
        });
    };

    const timer = setInterval(() => {
      if (!taskFinished(taskStatus)) {
        fetchData();
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  return (
    <>
      <div className="top-bar">
        <ProgressBar progress={taskProgress} maxWidth={100} thickness={0.3} />
        <Phasename
          currentPhase={currentPhase}
          maxPhase={maxPhase}
          phaseName={phaseName}
          progress={taskProgress}
        />
      </div>
      {taskFinished(taskStatus) ? (
        <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
          <Container
            fluid
            className="d-flex flex-wrap align-items-center mb-2 position-sticky"
          >
            <h3 className="mx-2 fw-bold">Display</h3>
            <Toggle
              toggleCondition={partShown === 0}
              variant="dark"
              onClick={() => setPartShown(0)}
              className="mx-2"
            >
              Attributes
            </Toggle>
            <Toggle
              toggleCondition={partShown === 1}
              variant="dark"
              onClick={() => setPartShown(1)}
              className="mx-2"
            >
              Dependencies
            </Toggle>
            <Toggle
              toggleCondition={partShown === 2}
              variant="dark"
              onClick={() => setPartShown(2)}
              className="mx-2"
            >
              Dataset
            </Toggle>
          </Container>

          <Row
            className={`w-100 flex-grow-1 justify-content-evenly ${
              partShown === 0 ? "" : "d-none"
            }`}
          >
            <Col xl={6} className="mt-5">
              <PieChartFull
                title="Left-hand side"
                attributes={attributesLHS}
                selectedAttributes={selectedAttributesLHS}
                setSelectedAttributes={setSelectedAttributesLHS}
              />
            </Col>
            <Col xl={6} className="mt-5">
              <PieChartFull
                title="Right-hand side"
                attributes={attributesRHS}
                maxItemsSelected={1}
                selectedAttributes={selectedAttributesRHS}
                setSelectedAttributes={setSelectedAttributesRHS}
              />
            </Col>
          </Row>

          <DependencyListFull
            file={file}
            setShowKeys={setShowKeys}
            showKeys={showKeys}
            dependencies={dependencies.filter(
              (dep) =>
                showKeys ||
                !keys.some(
                  (key) =>
                    dep.lhs.map((lhs) => lhs.name).includes(key) ||
                    dep.rhs.name === key
                )
            )}
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
      )}
    </>
  );
};

export default Viewer;
