import { useQuery } from "@apollo/client";
import React, { createContext, useContext, useEffect, useState } from "react";

import { GET_TASK_INFO } from "../../operations/queries/getTaskInfo";
import { ErrorContext } from "../ErrorContext";

type TaskContextType = {
  taskId: string;
  setTaskId: React.Dispatch<React.SetStateAction<string>>;
  file?: File;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskContextProvider: React.FC = ({ children }) => {
  const { showError } = useContext(ErrorContext)!;
  const [taskId, setTaskId] = useState<string>("");
  const [file, setFile] = useState<File>();

  const { data, loading, error } = useQuery(GET_TASK_INFO, {
    variables: { id: taskId },
    skip: !taskId,
    pollInterval: 500,
  });

  useEffect(() => {
    /* eslint-disable-next-line no-console */
    console.log(data);
  }, [data]);

  useEffect(() => {
    if (error) {
      showError({ code: 404, message: error.message });
    }
  }, [error]);

  const outValue = {
    taskId,
    setTaskId,
    file,
    setFile,
  };

  return (
    <TaskContext.Provider value={outValue}>{children}</TaskContext.Provider>
  );
};
