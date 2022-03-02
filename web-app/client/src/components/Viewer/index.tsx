import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";

import StatusDisplay from "../StatusDisplay/StatusDisplay";
import { TaskContext } from "../TaskContext";
import FDViewer from "./FDViewer";

const Index = () => {
  const { setTaskId, taskState, taskType, taskResult } =
    useContext(TaskContext)!;
  const { taskID } = useParams();

  useEffect(() => setTaskId(taskID), []);

  return taskState?.isExecuted ? (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      {taskType === "Functional Dependencies" && taskResult?.FD && (
        <FDViewer result={taskResult.FD} />
      )}
    </Container>
  ) : (
    <StatusDisplay text="Loading" />
  );
};

export default Index;
