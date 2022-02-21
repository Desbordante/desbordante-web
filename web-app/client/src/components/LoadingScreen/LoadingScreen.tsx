import React, { useEffect } from "react";
import { Container } from "react-bootstrap";

import PopupWindowContainer from "../PopupWindowContainer/PopupWindowContainer";
import ProgressBar from "../ProgressBar/ProgressBar";

interface Props {
  progress: number;
}

const LoadingScreen: React.FC<Props> = ({ progress }) => (
  <PopupWindowContainer onOutsideClick={() => {}}>
    <Container className="p-5 bg-dark rounded-3 shadow d-flex flex-column">
      <h1 className="text-white mb-4">Uploading your file. Please, wait.</h1>
      <ProgressBar maxWidth={100} progress={progress} thickness={0.8} rounded />
    </Container>
  </PopupWindowContainer>
);

export default LoadingScreen;
