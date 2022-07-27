import { useCallback, useContext, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import { IntersectionFilter, PrimitiveType } from "../types/globalTypes";
import { isMainPrimitiveType, TaskResult } from "../types/taskInfo";
import { ErrorContext } from "../components/ErrorContext";
import { GET_MAIN_TASK_DEPS } from "../graphql/operations/queries/getDeps";
import { GetMainTaskDeps, GetMainTaskDepsVariables } from "../graphql/operations/queries/__generated__/GetMainTaskDeps";
import { getDefaultFilterParams } from "../constants/primitives";

export const usePrimitiveList = (
  taskID?: string,
  primitiveType?: PrimitiveType,
  filter?: IntersectionFilter,
  isFinished?: boolean
) => {
  const { showError } = useContext(ErrorContext)!;

  const [taskResult, setTaskResult] = useState<TaskResult>();
  const [loading, setLoading] = useState(false);

  const [getTaskDeps] = useLazyQuery<GetMainTaskDeps, GetMainTaskDepsVariables>(GET_MAIN_TASK_DEPS, { fetchPolicy: "no-cache" });

  const getTaskResult = useCallback(async () => {
    if (!taskID || !primitiveType || !filter || !isFinished || !isMainPrimitiveType(primitiveType)) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await getTaskDeps(({
        variables: { taskID, filter: { ...getDefaultFilterParams(primitiveType), ...filter} }
      }))
      if (error) {
        throw error;
      }
      if (data == null || data.taskInfo.__typename !== "TaskInfo") {
        throw Error("Received data is undefined");
      }
      const { data: taskInfoData } = data.taskInfo;

      if (taskInfoData.result == null) {
        throw Error("Result is undefined");
      }
      setTaskResult(taskInfoData.result);
    } catch (error: any) {
      showError(error);
      return;
    }
    setLoading(false);
  }, [
    filter,
    getTaskDeps,
    primitiveType,
    showError,
    taskID,
    isFinished,
  ]);

  useEffect(() => {
    getTaskResult();
  }, [getTaskResult]);

  useEffect(() => {
    if (!taskID) {
      setTaskResult(undefined);
      setLoading(false);
    }
  }, [taskID]);

  return { taskResult, loading };
};
