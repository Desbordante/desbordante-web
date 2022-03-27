import {useCallback, useContext, useState} from "react";
import {useMutation} from "@apollo/client";
import {
  deleteTask,
  deleteTaskVariables,
} from "../graphql/operations/mutations/__generated__/deleteTask";
import {DELETE_TASK} from "../graphql/operations/mutations/deleteTask";
import {ErrorContext} from "../components/ErrorContext";

export const useDeleteTask = (taskID?: string) => {
  const {showError} = useContext(ErrorContext)!;

  const [loading, setLoading] = useState(false);

  const [deleteTaskMutation] = useMutation<deleteTask, deleteTaskVariables>(
    DELETE_TASK
  );

  const deleteTask = useCallback(async () => {
    if (!taskID) {
      return;
    }

    await setLoading(true);

    try {
      await deleteTaskMutation({variables: {taskID}});
    } catch (error: any) {
      showError(error);
      return;
    }
    setLoading(false);
  }, [deleteTaskMutation, showError, taskID]);

  return {deleteTask, loading};
};
