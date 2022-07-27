import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";

import { TaskContext } from "../TaskContext";
import FDViewer from "./FDViewer";
import CFDViewer from "./CFDViewer";
import ARViewer from "./ARViewer";
import { PrimitiveType } from "../../types/globalTypes";
import LoadingContainer from "../LoadingContainer/LoadingContainer";
import EDPViewer from "./EDPViewer";
import { ClustersContextProvider } from "./EDPViewer/ClustersContext";

const Index = () => {
  const { setTaskId, taskState, taskResult } =
    useContext(TaskContext)!;
  const { taskID } = useParams();

  useEffect(() => setTaskId(taskID), [taskID, setTaskId]);

  const is = (type: `${PrimitiveType}`) => taskResult?.__typename === (`${type}TaskResult`);

  return (
    <LoadingContainer
      isLoading={
        !(taskState?.__typename === "TaskState" && taskState.isExecuted)
      }
    >
      <Container
        fluid
        className="h-100 w-100 p-4 flex-grow-1 d-flex flex-column"
      >
        {is("FD") && <FDViewer />}
        {is("CFD") && <CFDViewer />}
        {is("AR") && <ARViewer />}
        {is("TypoFD") && (
          <ClustersContextProvider>
            <EDPViewer />
          </ClustersContextProvider>
        )}
      </Container>
    </LoadingContainer>
  );
};

export default Index;
