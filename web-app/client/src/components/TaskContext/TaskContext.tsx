import React, { createContext, useState } from "react";

import { taskStatus } from "../../types";

type TaskContextType = {
  taskId: string;
  setTaskId: React.Dispatch<React.SetStateAction<string>>;
  taskProgress: number;
  setTaskProgress: React.Dispatch<React.SetStateAction<number>>;
  currentPhase: number;
  setCurrentPhase: React.Dispatch<React.SetStateAction<number>>;
  phaseName: string;
  setPhaseName: React.Dispatch<React.SetStateAction<string>>;
  maxPhase: number;
  setMaxPhase: React.Dispatch<React.SetStateAction<number>>;
  taskStatus: taskStatus;
  setTaskStatus: React.Dispatch<React.SetStateAction<taskStatus>>;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  delimiter: string;
  setDelimiter: React.Dispatch<React.SetStateAction<string>>;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskContextProvider: React.FC = ({ children }) => {
  const [taskId, setTaskId] = useState<string>("");
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [phaseName, setPhaseName] = useState<string>("");
  const [maxPhase, setMaxPhase] = useState<number>(0);
  // eslint-disable-next-line no-shadow
  const [taskStatus, setTaskStatus] = useState<taskStatus>("UNSCHEDULED");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>("");

  const outValue = {
    taskId,
    setTaskId,
    taskProgress,
    setTaskProgress,
    currentPhase,
    setCurrentPhase,
    phaseName,
    setPhaseName,
    maxPhase,
    setMaxPhase,
    taskStatus,
    setTaskStatus,
    file,
    setFile,
    fileName,
    setFileName,
    delimiter,
    setDelimiter,
  };

  return (
    <TaskContext.Provider value={outValue}>{children}</TaskContext.Provider>
  );
};
