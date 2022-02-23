import React, { useContext, useEffect } from "react";
import { Container } from "react-bootstrap";

import { FileFormContext } from "../FileFormContext";
import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import ProgressBar from "../ProgressBar/ProgressBar";

const LoadingScreen = () => {
  const { fileUploadProgress } = useContext(FileFormContext)!;

  return (
    <PopupWindowContainer onOutsideClick={() => {}}>
      <Container className="p-5 bg-dark rounded-3 shadow d-flex flex-column">
        <h1 className="text-white mb-4">Uploading your file. Please, wait.</h1>
        <ProgressBar
          maxWidth={100}
          progress={fileUploadProgress}
          thickness={0.8}
          rounded
        />
      </Container>
    </PopupWindowContainer>
  );
};

export default LoadingScreen;
