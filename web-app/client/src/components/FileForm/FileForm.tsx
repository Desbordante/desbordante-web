import React, { useContext } from "react";
import styled from "styled-components";

import LoadingScreen from "../LoadingScreen/LoadingScreen";
import ChoosePrimitive from "./ChoosePrimitive";
import ChooseDataset from "./ChooseDataset";
import ChooseFileProps from "./ChooseFileProps";
import ChooseAlgorithmProps from "./ChooseAlgorithmProps";
import CreateTaskButton from "./CreateTaskButton";
import { FileFormContext } from "../FileFormContext";
import { ErrorContext } from "../ErrorContext";

const StyledFileFormContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 1rem;
  
  @media (max-width: 1650px) {
    display: block;
  }
`;

const FileForm = () => {
  const { fileUploadProgress } = useContext(FileFormContext)!;
  const { isErrorShown } = useContext(ErrorContext)!;

  return (
    <div
      className="file-form flex-grow-1 d-flex flex-column align-items-center"
    >
      {fileUploadProgress > 0 && !isErrorShown && <LoadingScreen />}
      <ChoosePrimitive />
      <StyledFileFormContainer className="px-5">
        <ChooseDataset />
        <ChooseFileProps />
        <ChooseAlgorithmProps />
      </StyledFileFormContainer>
      <CreateTaskButton />
    </div>
  );
};

export default FileForm;
