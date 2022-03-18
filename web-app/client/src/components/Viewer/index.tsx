import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";

import StatusDisplay from "../StatusDisplay/StatusDisplay";
import { TaskContext } from "../TaskContext";
import FDViewer from "./FDViewer";
import CFDViewer from "./CFDViewer";
import ARViewer from "./ARViewer";
import { PrimitiveType } from "../../types/globalTypes";

const Index = () => {
  const { setTaskId, taskState, taskType, taskResult } =
    useContext(TaskContext)!;
  const { taskID } = useParams();

  useEffect(() => setTaskId(taskID), [taskID, setTaskId]);

  return taskState && "isExecuted" in taskState && taskState.isExecuted ? (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      {taskType === PrimitiveType.FD && taskResult?.FD && (
        <FDViewer result={taskResult.FD} />
      )}
      {taskType === PrimitiveType.CFD && taskResult?.CFD && (
        <CFDViewer result={taskResult.CFD} />
      )}
      {taskType === PrimitiveType.AR && taskResult?.AR && (
        <ARViewer result={taskResult.AR} />
      )}
    </Container>
  ) : (
    <StatusDisplay text="Loading" />
  );
};

export default Index;
