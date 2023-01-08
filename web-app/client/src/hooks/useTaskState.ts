// hooks
import { useLazyQuery, useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useEffect, useLayoutEffect } from 'react';
// Task State Atom with data from the server
import taskStateAtom, {
  taskStateAtomDefaultValues,
  taskStateAtomDefaultValuesWithID,
} from '@atoms/primaryAtoms/taskStateAtom';
// queries
import {
  getTaskState,
  getTaskState_taskInfo_state,
  getTaskState_taskInfo_state_TaskState,
  getTaskStateVariables,
} from '@graphql/operations/queries/__generated__/getTaskState';
import {
  getTaskStateLite,
  getTaskStateLiteVariables,
} from '@graphql/operations/queries/__generated__/getTaskStateLite';
import { GET_TASK_STATE } from '@graphql/operations/queries/getTaskState';
import { GET_TASK_STATE_LITE } from '@graphql/operations/queries/getTaskStateLite';
// error message
import { showError } from '@utils/toasts';

const useTaskState = () => {
  // TODO: test query
  const router = useRouter();
  const taskID = router.query.taskID as string;
  // Task State Atom
  const [taskState, setTaskState] = useAtom(taskStateAtom);

  // Query
  const {
    loading: liteLoading,
    error: liteError,
    data: liteData,
    startPolling,
    stopPolling,
  } = useQuery<getTaskStateLite, getTaskStateLiteVariables>(
    GET_TASK_STATE_LITE,
    {
      variables: {
        taskID: taskID,
      },
      onError: (error) => {
        showError(error.message, "Can't fetch task state. Please try later.");
      },
    }
  );

  const [
    loadFullTaskState,
    { loading: fullLoading, error: fullError, data: fullData },
  ] = useLazyQuery<getTaskState, getTaskStateVariables>(GET_TASK_STATE, {
    onError: (error) => {
      showError(error.message, "Can't fetch task state. Please try later.");
    },
  });

  useEffect(() => {
    if (taskID !== taskState.taskID) {
      setTaskState(taskStateAtomDefaultValuesWithID(taskID));
      startPolling(2000);
    }
  }, []);

  useEffect(() => {
    if (
      taskState.taskID === taskID &&
      taskState.state.__typename === 'TaskState' &&
      taskState.state.processStatus === 'COMPLETED'
    ) {
      if (taskState.type === '') {
        stopPolling();
        loadFullTaskState({
          variables: {
            taskID: taskID,
          },
        });
      }

      return;
    }

    const state = liteData?.taskInfo.state as getTaskState_taskInfo_state;

    if (state && 'processStatus' in state) {
      if (state.processStatus === 'COMPLETED') {
        stopPolling();
        if (taskState.type === '')
          loadFullTaskState({
            variables: {
              taskID: taskID,
            },
          });
      } else {
        setTaskState({
          ...taskStateAtomDefaultValuesWithID(taskID),
          state: state, // || taskStateAtomDefaultValues.state,
        });
      }
    }
    if (state && state.__typename !== 'TaskState') {
      stopPolling();
      setTaskState({
        ...taskStateAtomDefaultValuesWithID(taskID),
        state: state,
      });
    }
  }, [liteData]);

  useEffect(() => {
    if (
      taskState.taskID === taskID &&
      taskState.state.__typename === 'TaskState' &&
      taskState.state.processStatus === 'COMPLETED' &&
      taskState.type !== ''
    )
      return;

    const state = fullData?.taskInfo
      .state as getTaskState_taskInfo_state_TaskState;
    const data = fullData?.taskInfo.data;

    if (data && state && 'processStatus' in state) {
      setTaskState({
        taskID: taskID,
        algorithmName: data?.baseConfig.algorithmName || '',
        type: data?.baseConfig.type || '',
        state: state || taskStateAtomDefaultValues.state,
      });
    }
  }, [fullLoading, fullData]);

  return {
    data:
      taskState.taskID === taskID
        ? taskState
        : taskStateAtomDefaultValuesWithID(taskID),
    loading: liteLoading || fullLoading || taskState.taskID !== taskID,
    error: !fullError ? liteError : fullError,
  };
};

export default useTaskState;
