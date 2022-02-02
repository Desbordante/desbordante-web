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
  } = useContext(TaskContext)!;
  setTaskId(taskID);

  const [attributesLHS, setAttributesLHS] = useState<attribute[]>([]);
  const [attributesRHS, setAttributesRHS] = useState<attribute[]>([]);

  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    attribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    attribute[]
  >([]);

  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [showKeys, setShowKeys] = useState(true);

  console.log(keys);

  const taskFinished = (status: taskStatus) =>
    status === "COMPLETED" || status === "SERVER ERROR";

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`${serverURL}/getTaskInfo?taskID=${taskID}`, { timeout: 2000 })
        .then((task) => task.data)
        .then((data) => {
          console.log(data);
          setFileName(data.filename);
          setTaskProgress(data.progress / 100);
          setPhaseName(data.phasename);
          setCurrentPhase(data.currentphase);
          setMaxPhase(data.maxphase);
          setTaskStatus(data.status);
          if (taskFinished(data.status)) {
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
      <Container
        fluid
        className="h-100 flex-grow-1 d-flex flex-column justify-content-between align-items-center"
      >
        {taskFinished(taskStatus) ? (
          <Router>
            <Route path={`/attrs/${taskID}`}>
              <Row className="w-100 justify-content-evenly">
                <Col xl={6}>
                  <PieChartFull
                    title="Left-hand side"
                    attributes={attributesLHS}
                    selectedAttributes={selectedAttributesLHS}
                    setSelectedAttributes={setSelectedAttributesLHS}
                  />
                </Col>
                <Col xl={6}>
                  <PieChartFull
                    title="Right-hand side"
                    attributes={attributesRHS}
                    maxItemsSelected={1}
                    selectedAttributes={selectedAttributesRHS}
                    setSelectedAttributes={setSelectedAttributesRHS}
                  />
                </Col>
              </Row>
              <footer className="my-5 d-flex align-items-center">
                <h1 className="text-black fw-bold mx-2">View Dependencies</h1>
                <Link to={`/deps/${taskID}`}>
                  <Button variant="dark" onClick={() => {}} className="mx-2">
                    <img src="/icons/nav-down.svg" alt="down" />
                  </Button>
                </Link>
              </footer>
            </Route>

            <Route path={`/deps/${taskID}`}>
              <DependencyListFull
                taskId={taskID}
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
              />
              <footer className="mb-5 d-flex align-items-center">
                <h1 className="text-black fw-bold mx-2">View Attributes</h1>
                <Link to={`/attrs/${taskID}`}>
                  <Button variant="dark" onClick={() => {}} className="mx-2">
                    <img src="/icons/nav-up.svg" alt="up" />
                  </Button>
                </Link>
              </footer>
            </Route>
          </Router>
        ) : (
          <StatusDisplay text="Loading" />
        )}
      </Container>
    </>
  );
};

export default Viewer;
