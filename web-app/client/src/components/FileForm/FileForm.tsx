import React, { useContext } from "react";
import { Container, Row } from "react-bootstrap";

import LoadingScreen from "../LoadingScreen/LoadingScreen";
import ChoosePrimitive from "./ChoosePrimitive";
import ChooseDataset from "./ChooseDataset";
import ChooseFileProps from "./ChooseFileProps";
import ChooseAlgorithmProps from "./ChooseAlgorithmProps";
import CreateTaskButton from "./CreateTaskButton";
import { FileFormContext } from "../FileFormContext";
import { ErrorContext } from "../ErrorContext";

const FileForm = () => {
  const { fileUploadProgress } = useContext(FileFormContext)!;
  const { isErrorShown } = useContext(ErrorContext)!;

  return (
    <Container
      fluid="md"
      className="file-form flex-grow-1 flex-shrink-0 d-flex flex-column justify-content-start align-items-center"
    >
      {fileUploadProgress > 0 && !isErrorShown && <LoadingScreen />}
      <ChoosePrimitive />
      <Row>
        <ChooseDataset />
        <ChooseFileProps />
        <ChooseAlgorithmProps />
      </Row>
      <CreateTaskButton />
    </Container>
  );
};

export default FileForm;
