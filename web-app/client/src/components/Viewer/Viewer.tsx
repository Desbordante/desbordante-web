/* eslint-disable */

import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  useParams,
  useHistory,
} from "react-router-dom";
import axios from "axios";
import hslToHex from "hsl-to-hex";

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
  coloredAttribute,
  coloredDepedency,
} from "../../types";

interface Props {
  file: File | null;
  setFile: (file: File | null) => void;
}

const Viewer: React.FC<Props> = ({ file, setFile }) => {
  let { taskID } = useParams<{ taskID: string }>();
  const history = useHistory();

  const [taskProgress, setTaskProgress] = useState(0);
  const [phaseName, setPhaseName] = useState("");
  const [currentPhase, setCurrentPhase] = useState(3);
  const [maxPhase, setMaxPhase] = useState(5);
  const [taskStatus, setTaskStatus] = useState<taskStatus>("UNSCHEDULED");
  const [filename, setFilename] = useState<string>("");

  const [attributesLHS, setAttributesLHS] = useState<coloredAttribute[]>([]);
  const [attributesRHS, setAttributesRHS] = useState<coloredAttribute[]>([]);

  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    coloredAttribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    coloredAttribute[]
  >([]);

  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const dependencyColors = [...Array(10)].map((_, index) =>
    hslToHex((360 / 9) * index, 40, 45)
  );
  const [keys, setKeys] = useState<string[]>([]);
  const [showKeys, setShowKeys] = useState(true);

  console.log(keys);

  function createColoredDep(
    dep: dependency,
    colorsBuffer: string[]
  ): coloredDepedency {
    return {
      lhs: dep.lhs.map((attr) => ({
        name: attr.name,
        value: attr.value,
        color: pickRandomColor(colorsBuffer),
      })),
      rhs: {
        name: dep.rhs.name,
        value: dep.rhs.value,
        color: pickRandomColor(colorsBuffer),
      },
    };
  }

  const pickRandomColor = (colors: string[]) => {
    const pickedIndex = Math.floor(Math.random() * colors.length);
    const pickedElement = colors[pickedIndex];
    colors.splice(pickedIndex, 1);
    return pickedElement;
  };

  const taskFinished = (status: taskStatus) =>
    status === "COMPLETED" || status === "SERVER ERROR";

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`${serverURL}/getTaskInfo?taskID=${taskID}`, { timeout: 2000 })
        .then((task) => task.data)
        .then((data) => {
          console.log(data);
          setFilename(data.filename);
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
        <header>
          <div className="left">
            <img src="/icons/logo.svg" alt="logo" className="logo-medium" />
            <h1>File: "{filename}"</h1>
            <h1>Status: {taskStatus}</h1>
          </div>
          <Button type="button" onClick={() => {
            history.push("/")
            setFile(null)
          }}>
            Cancel
          </Button>
        </header>
        <ProgressBar progress={taskProgress} maxWidth={100} thickness={0.5} />
        <Phasename
          currentPhase={currentPhase}
          maxPhase={maxPhase}
          phaseName={phaseName}
          progress={taskProgress}
        />
      </div>
      <Router>
        {/* <Switch> */}
        <Route path={`/attrs/${taskID}`}>
          <div className="bg-light">
            {taskFinished(taskStatus) ? null : (
              <StatusDisplay type="loading" text="Loading" />
            )}
            <div
              className="charts-with-controls"
              style={{
                opacity: taskFinished(taskStatus) ? 1 : 0,
              }}
            >
              <PieChartFull
                title="Left-hand side"
                attributes={attributesLHS}
                selectedAttributes={selectedAttributesLHS}
                setSelectedAttributes={setSelectedAttributesLHS}
              />
              <PieChartFull
                title="Right-hand side"
                attributes={attributesRHS}
                maxItemsSelected={1}
                selectedAttributes={selectedAttributesRHS}
                setSelectedAttributes={setSelectedAttributesRHS}
              />
            </div>
            <footer style={{ opacity: taskFinished(taskStatus) ? 1 : 0 }}>
              <h1
                className="bottom-title"
                style={{ color: "#000000", fontWeight: 500 }}
              >
                View Dependencies
              </h1>
              <Link to={`/deps/${taskID}`}>
                <Button color="0" onClick={() => {}}>
                  <img src="/icons/nav-down.svg" alt="down" />
                </Button>
              </Link>
            </footer>
          </div>
        </Route>
        <Route path={`/deps/${taskID}`}>
          <div className="bg-light" style={{ justifyContent: "space-between" }}>
            <DependencyListFull
              taskId={taskID}
              file={file}
              setShowKeys={setShowKeys}
              showKeys={showKeys}
              dependencies={dependencies
                .filter(
                  (dep) =>
                    showKeys ||
                    !keys.some(
                      (key) =>
                        dep.lhs.map((lhs) => lhs.name).includes(key) ||
                        dep.rhs.name === key
                    )
                )
                .map((dep) => createColoredDep(dep, dependencyColors.slice(0)))}
              selectedAttributesLHS={selectedAttributesLHS}
              selectedAttributesRHS={selectedAttributesRHS}
            />
            <footer>
              <h1
                className="bottom-title"
                style={{ color: "#000", fontWeight: 500 }}
              >
                View Attributes
              </h1>
              <Link to={`/attrs/${taskID}`}>
                <Button color="0" onClick={() => {}}>
                  <img src="/icons/nav-up.svg" alt="up" />
                </Button>
              </Link>
            </footer>
          </div>
        </Route>
        {/* </Switch> */}
      </Router>
    </>
  );
};

export default Viewer;
