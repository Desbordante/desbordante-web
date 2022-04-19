import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useLazyQuery} from "@apollo/client";

import {
  getTaskInfo,
  getTaskInfoVariables,
} from "../graphql/operations/queries/__generated__/getTaskInfo";
import {GET_TASK_INFO} from "../graphql/operations/queries/getTaskInfo";
import {TaskProperties, TaskState} from "../types/taskInfo";
import {PrimitiveType} from "../types/globalTypes";
import {ErrorContext} from "../components/ErrorContext";

export const useTaskInfo = (taskID?: string) => {
  const {showError} = useContext(ErrorContext)!;

  const [taskState, setTaskState] = useState<TaskState>();
  const [taskType, setTaskType] = useState<PrimitiveType>();
  const [taskProperties, setTaskProperties] = useState<TaskProperties>();

  const [getTaskInfoQuery] = useLazyQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO
  );

  const queryRef = useRef<NodeJS.Timer | null>(null);

  const stopPolling = () => {
    if (queryRef.current) {
      clearInterval(queryRef.current);
      queryRef.current = null;
    }
  };

  const updateTaskInfo = useCallback(async () => {
    if (!taskID) {
      return;
    }
    try {
      const {data} = await getTaskInfoQuery({
        variables: {taskID},
      });
      if (data) {
        const {
          state,
          data: {
            baseConfig: {type, algorithmName},
            specificConfig,
          },
        } = data.taskInfo;

        setTaskType(type);
        setTaskProperties({algorithmName, specificConfig});
        // eslint-disable-next-line no-underscore-dangle
        switch (state.__typename) {
          case "TaskState": {
            setTaskState(state);
            if (state.isExecuted) {
              stopPolling();
            }
            return;
          }
          case "InternalServerTaskError": {
            showError({
              message: state.internalError || "Internal server error",
            });
            stopPolling();
            return;
          }
          case "ResourceLimitTaskError": {
            showError({message: state.resourceLimitError});
            stopPolling();
            return;
          }
          default: {
            stopPolling();
            showError({message: "Unexpected application behaviour"});
          }
        }
      }
    } catch (error: any) {
      stopPolling();
      showError(error);
    }
  }, [taskID, getTaskInfoQuery, showError]);

  useEffect(() => {
    if (!queryRef.current && taskID) {
      queryRef.current = setInterval(updateTaskInfo, 500);
    }

    return stopPolling;
  }, [taskID, updateTaskInfo]);

  useEffect(() => {
    if (!taskID) {
      setTaskState(undefined);
      setTaskType(undefined);
    }
  }, [taskID]);

  return {taskState, taskType, taskProperties};
};
