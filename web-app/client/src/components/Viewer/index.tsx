import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";

import StatusDisplay from "../StatusDisplay/StatusDisplay";
import { TaskContext } from "../TaskContext";
import FDViewer from "./FDViewer";
import CFDViewer from "./CFDViewer";
import ARViewer from "./ARViewer";
import { PrimitiveType } from "../../types/globalTypes";
import LoadingContainer from "../LoadingContainer/LoadingContainer";

const Index = () => {
  const { setTaskId, taskState, taskType, taskResult } =
    useContext(TaskContext)!;
  const { taskID } = useParams();

  useEffect(() => setTaskId(taskID), [taskID, setTaskId]);

  return (
    <LoadingContainer
      isLoading={
        // eslint-disable-next-line no-underscore-dangle
        !(taskState?.__typename === "TaskState" && taskState.isExecuted)
      }
    >
      <Container
        fluid
        className="h-100 w-100 p-4 flex-grow-1 d-flex flex-column"
      >
        {taskType === PrimitiveType.FD && <FDViewer />}
        {taskType === PrimitiveType.CFD && taskResult?.CFD && (
          <CFDViewer result={taskResult.CFD} />
        )}
        {taskType === PrimitiveType.AR && taskResult?.AR && (
          <ARViewer result={taskResult.AR} />
        )}
      </Container>
    </LoadingContainer>
  );
};

export default Index;
