import { useLazyQuery, useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import taskStateAtom, {
  taskStateAtomDefaultValues,
  taskStateAtomDefaultValuesWithID,
} from '@atoms/primaryAtoms/taskStateAtom';
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
import { showError } from '@utils/toasts';
import { GET_TASK_TYPE } from '@graphql/operations/queries/getTaskType';

const useTaskState = () => {
  const router = useRouter();
  const taskID = router.query.taskID as string;
  const [taskState, setTaskState] = useAtom(taskStateAtom);

  const {
    loading: typeLoading,
    error: typeError,
    data: typeData,
  } = useQuery(GET_TASK_TYPE, {
    variables: {
      taskID,
    },
    onError: (error) => {
      showError(error.message, "Can't fetch task type. Please try later.");
    },
  });

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
        taskID,
      },
      onError: (error) => {
        showError(error.message, "Can't fetch task state. Please try later.");
      },
    },
  );

  useEffect(() => {
    if (taskID !== taskState.taskID) {
      setTaskState(taskStateAtomDefaultValuesWithID(taskID));
      startPolling(2000);
    }

    if (!taskState.algorithmName || !taskState.type) {
      const baseConfig = typeData?.taskInfo.data.baseConfig;
      const algorithmName = baseConfig?.algorithmName;
      const type = baseConfig?.type;
      setTaskState({
        ...taskStateAtomDefaultValuesWithID(taskID),
        algorithmName,
        type,
      });
    }
  }, [typeData]);

  useEffect(() => {
    if (
      taskState.taskID === taskID &&
      taskState.state.__typename === 'TaskState' &&
      taskState.state.processStatus === 'COMPLETED'
    ) {
      stopPolling();
    }

    const state = liteData?.taskInfo.state as getTaskState_taskInfo_state;

    if (state && 'processStatus' in state) {
      setTaskState({
        ...taskState,
        state: state,
      });
    }
    if (state && state.__typename !== 'TaskState') {
      stopPolling();
      setTaskState({
        ...taskStateAtomDefaultValuesWithID(taskID),
        state,
      });
    }
  }, [liteData]);

  return {
    data:
      taskState.taskID === taskID
        ? taskState
        : taskStateAtomDefaultValuesWithID(taskID),
    loading: liteLoading || typeLoading || taskState.taskID !== taskID,
    error: !liteError ? typeError : liteError,
  };
};

export default useTaskState;
