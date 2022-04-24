import React, { useContext } from "react";
import { Row } from "react-bootstrap";

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
    <div
      className="file-form flex-grow-1 d-flex flex-column align-items-center"
    >
      {fileUploadProgress > 0 && !isErrorShown && <LoadingScreen />}
      <ChoosePrimitive />
      <Row className="w-100 px-5">
        <ChooseDataset />
        <ChooseFileProps />
        <ChooseAlgorithmProps />
      </Row>
      <CreateTaskButton />
    </div>
  );
};

export default FileForm;
