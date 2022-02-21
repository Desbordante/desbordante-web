import React, { useState } from "react";
import { Container, Row } from "react-bootstrap";

import LoadingScreen from "../LoadingScreen/LoadingScreen";
import Greeting from "./Greeting";
import FunctionalDependencies from "./FunctionalDependencies";
import ConditionalFunctionalDependencies from "./ConditionalFunctionalDependencies";
import AssociationRules from "./AssociationRules";
import ErrorDetectionPipeline from "./ErrorDetectionPipeline";

const FileForm = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dependencyType, setDependencyType] = useState(0);

  return (
    <Container
      fluid="md"
      className="file-form h-100 flex-shrink-0 d-flex flex-column justify-content-start align-items-center"
    >
      {uploadProgress > 0 && <LoadingScreen progress={uploadProgress} />}
      <Greeting
        dependencyType={dependencyType}
        setDependencyType={setDependencyType}
      />
      {dependencyType === 0 && (
        <FunctionalDependencies setUploadProgress={setUploadProgress} />
      )}
      {dependencyType === 1 && (
        <ConditionalFunctionalDependencies
          setUploadProgress={setUploadProgress}
        />
      )}
      {dependencyType === 2 && (
        <AssociationRules setUploadProgress={setUploadProgress} />
      )}
      {dependencyType === 3 && (
        <ErrorDetectionPipeline setUploadProgress={setUploadProgress} />
      )}
    </Container>
  );
};

export default FileForm;
