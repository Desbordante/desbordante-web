import { useLazyQuery, useMutation } from "@apollo/client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DELETE_TASK } from "../graphql/operations/mutations/deleteTask";
import { deleteTask } from "../graphql/operations/mutations/__generated__/deleteTask";

import { GET_TASK_INFO } from "../graphql/operations/queries/getTaskInfo";
import {
  taskInfo,
  taskInfo_taskInfo_dataset_snippet,
  taskInfo_taskInfo_data_FDTask,
} from "../graphql/operations/queries/__generated__/taskInfo";
import { dependency, pieChartData } from "../types";
import { ErrorContext } from "./ErrorContext";

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
  deleteTask: () => Promise<any>;
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

  const [fileName, setFileName] = useState<string>();
  const [snippet, setSnippet] = useState<taskInfo_taskInfo_dataset_snippet>();

  const [pieChartData, setPieChartData] = useState<pieChartData>();
  const [dependencies, setDependencies] = useState<dependency[]>();
  const [keys, setKeys] = useState<string[]>();

  const resetTask = async () => {
    setTaskId(undefined);
    setIsExecuted(undefined);
    setStatus(undefined);
    setProgress(0);
    setPhaseName(undefined);
    setCurrentPhase(undefined);
    setMaxPhase(undefined);

    setFileName(undefined);
    setSnippet(undefined);

    setPieChartData(undefined);
    setDependencies(undefined);
    setKeys(undefined);
  };

  const [query, { data, error }] = useLazyQuery<taskInfo>(GET_TASK_INFO);
  const [deleteTask, { error: deleteError }] = useMutation<deleteTask>(
    DELETE_TASK,
    {
      variables: {
        taskID: taskId,
      },
    }
  );

  const queryRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    queryRef.current = setInterval(
      () =>
        query({
          variables: { id: taskId },
        }),
      500
    );
  }, [taskId]);

  useEffect(() => {
    if (!taskId || isExecuted || error) {
      clearInterval(queryRef.current!);
    }
  }, [taskId, isExecuted, error]);

  useEffect(() => {
    if (data) {
      setIsExecuted(data.taskInfo.state.isExecuted);
      setStatus(data.taskInfo.state.status);
      setProgress(data.taskInfo.state.progress / 100);
      setPhaseName(data.taskInfo.state.phaseName || undefined);
      setCurrentPhase(data.taskInfo.state.currentPhase || undefined);
      setMaxPhase(data.taskInfo.state.maxPhase || undefined);

      setFileName(data.taskInfo.dataset.tableInfo.originalFileName);
      setSnippet(data.taskInfo.dataset.snippet);

      setPieChartData(
        // @ts-ignore
        (data.taskInfo.data as taskInfo_taskInfo_data_FDTask).FDResult
          ?.pieChartData || undefined
      );
      setDependencies(
        (
          data.taskInfo.data as taskInfo_taskInfo_data_FDTask
        ).FDResult?.FDs?.map((dep) => ({
          lhs:
            dep?.lhs.map(
              (index) => data.taskInfo.dataset.snippet.header[index] || "null"
            ) || [],
          rhs: data.taskInfo.dataset.snippet.header[dep?.rhs || 0] || "null",
        }))
      );
      setKeys(
        (
          data.taskInfo.data as taskInfo_taskInfo_data_FDTask
        ).FDResult?.PKs?.map((attr) => attr?.name!) || undefined
      );
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      showError({ message: error.message });
    }
  }, [error]);

  useEffect(() => {
    if (deleteError) {
      showError({ message: deleteError.message });
    }
  }, [deleteError]);

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
    deleteTask,
  };

  return (
    <TaskContext.Provider value={outValue}>{children}</TaskContext.Provider>
  );
};
