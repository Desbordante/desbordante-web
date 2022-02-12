import { useQuery } from "@apollo/client";
import React, { createContext, useContext, useEffect, useState } from "react";

import { GET_TASK_INFO } from "../../operations/queries/getTaskInfo";
import {
  taskInfo,
  taskInfo_taskInfo_dataset_snippet,
  taskInfo_taskInfo_data_FDTask,
} from "../../operations/queries/__generated__/taskInfo";
import { dependency, pieChartData } from "../../types";
import { ErrorContext } from "../ErrorContext";

type TaskContextType = {
  taskId: string | undefined;
  setTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
  isExecuted: boolean | undefined;
  status: string | undefined;
  progress: number;
  phaseName: string | undefined;
  currentPhase: number | undefined;
  maxPhase: number | undefined;
  fileName: string | undefined;
  snippet: taskInfo_taskInfo_dataset_snippet | undefined;
  pieChartData: pieChartData | undefined;
  dependencies: dependency[] | undefined;
  keys: string[] | undefined;
  resetTask: () => void;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskContextProvider: React.FC = ({ children }) => {
  const { showError } = useContext(ErrorContext)!;

  const [taskId, setTaskId] = useState<string>();
  const [isExecuted, setIsExecuted] = useState<boolean>();
  const [status, setStatus] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [phaseName, setPhaseName] = useState<string>();
  const [currentPhase, setCurrentPhase] = useState<number>();
  const [maxPhase, setMaxPhase] = useState<number>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const [fileName, setFileName] = useState<string>();
  const [snippet, setSnippet] = useState<taskInfo_taskInfo_dataset_snippet>();

  const [pieChartData, setPieChartData] = useState<pieChartData>();
  const [dependencies, setDependencies] = useState<dependency[]>();
  const [keys, setKeys] = useState<string[]>();

  const resetTask = () => {
    setTaskId(undefined);
    setIsExecuted(undefined);
    setStatus(undefined);
    setProgress(0);
    setPhaseName(undefined);
    setCurrentPhase(undefined);
    setMaxPhase(undefined);
    setErrorMsg(undefined);

    setFileName(undefined);
    setSnippet(undefined);

    setPieChartData(undefined);
    setDependencies(undefined);
    setKeys(undefined);
  };

  const { data, error } = useQuery<taskInfo>(GET_TASK_INFO, {
    variables: { id: taskId },
    skip: !taskId || isExecuted,
    pollInterval: 500,
  });

  useEffect(() => {
    if (data) {
      setIsExecuted(data.taskInfo.state.isExecuted);
      setStatus(data.taskInfo.state.status);
      setProgress(data.taskInfo.state.progress / 100);
      setPhaseName(data.taskInfo.state.phaseName || undefined);
      setCurrentPhase(data.taskInfo.state.currentPhase || undefined);
      setMaxPhase(data.taskInfo.state.maxPhase || undefined);
      setErrorMsg(data.taskInfo.state.errorMsg || undefined);

      setFileName(data.taskInfo.dataset.tableInfo.originalFileName);
      setSnippet(data.taskInfo.dataset.snippet);

      setPieChartData(
        // @ts-ignore
        (data.taskInfo.data as taskInfo_taskInfo_data_FDTask).result
          ?.pieChartData || undefined
      );
      setDependencies(
        (data.taskInfo.data as taskInfo_taskInfo_data_FDTask).result?.FDs?.map(
          (dep) => ({
            lhs:
              dep?.lhs.map(
                (index) => data.taskInfo.dataset.snippet.header[index] || "null"
              ) || [],
            rhs: data.taskInfo.dataset.snippet.header[dep?.rhs || 0] || "null",
          })
        )
      );
      setKeys(
        (data.taskInfo.data as taskInfo_taskInfo_data_FDTask).result?.PKs?.map(
          (attr) => attr?.name!
        ) || undefined
      );
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      showError({ message: error.message });
    }
  }, [error, showError]);

  useEffect(() => {
    if (errorMsg) {
      showError({ message: errorMsg });
    }
  }, [errorMsg, showError]);

  const outValue = {
    taskId,
    setTaskId,
    isExecuted,
    status,
    progress,
    phaseName,
    currentPhase,
    maxPhase,
    fileName,
    snippet,
    pieChartData,
    dependencies,
    keys,
    resetTask,
  };

  return (
    <TaskContext.Provider value={outValue}>{children}</TaskContext.Provider>
  );
};
