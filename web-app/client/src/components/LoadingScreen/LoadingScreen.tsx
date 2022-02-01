import React, { useEffect } from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./LoadingScreen.scss";

interface Props {
  onComplete: () => void;
  progress: number;
}

const LoadingScreen: React.FC<Props> = ({ onComplete, progress }) => {
  useEffect(() => {
    if (progress >= 1) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="w-100 h-100 flex-grow-1 bg-dark d-flex flex-column justify-content-center align-items-center">
      <h1 className="text-white my-4">Uploading your file. Please, wait.</h1>
      <ProgressBar maxWidth={50} progress={progress} thickness={0.8} rounded />
    </div>
  );
};

export default LoadingScreen;
