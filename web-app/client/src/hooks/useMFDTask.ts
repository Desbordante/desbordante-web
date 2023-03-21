import { useLazyQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import MFDAtom, { MFDAtomDefaultValuesWithParams } from '@atoms/MFDTaskAtom';
import {
  GetMFDTaskData,
  GetMFDTaskDataVariables,
} from '@graphql/operations/queries/__generated__/GetMFDTaskData';
import { GET_MFD_TASK_DATA } from '@graphql/operations/queries/getMFDTaskData';
import { showError } from '@utils/toasts';
import { MFDSortBy, OrderBy } from 'types/globalTypes';

const useMFDTask = (
  taskID: string,
  clusterIndex = 0,
  limit = 150,
  sortBy = MFDSortBy.POINT_INDEX,
  orderBy = OrderBy.ASC
) => {
  const [MFDTask, setMFDTask] = useAtom(MFDAtom);
  const [loadMFDData, { loading, error, data }] = useLazyQuery<
    GetMFDTaskData,
    GetMFDTaskDataVariables
  >(GET_MFD_TASK_DATA, {
    variables: {
      taskID,
      clusterIndex,
      offset: 0,
      limit,
      sortBy,
      orderBy,
    },
    onError: (error) => {
      console.error(error);
      showError(error.message, "Can't fetch task data. Please try later.");
    },
  });

  useEffect(() => {
    if (
      MFDTask.taskID !== taskID ||
      MFDTask.clusterIndex !== clusterIndex ||
      MFDTask.pagination.limit !== limit ||
      MFDTask.sortBy !== sortBy ||
      MFDTask.result === undefined
    ) {
      loadMFDData().then();
    }
  }, []);

  useEffect(() => {
    if (
      data?.taskInfo !== undefined &&
      'data' in data?.taskInfo &&
      data?.taskInfo.data?.result !== null &&
      'result' in data?.taskInfo.data?.result
    ) {
      const taskData = data?.taskInfo.data?.result;
      setMFDTask({
        ...MFDAtomDefaultValuesWithParams(
          taskID,
          clusterIndex,
          limit,
          sortBy,
          orderBy
        ),
        result: taskData?.result || false,
        clustersTotalCount: taskData?.clustersTotalCount || 0,
        cluster: {
          value: taskData?.cluster?.value || '',
          highlightsTotalCount: taskData?.cluster?.highlightsTotalCount || 0,
          highlights: (taskData?.cluster?.highlights || []).map(
            (highlight, index) => ({ ...highlight, rowIndex: index })
          ),
        },
      });
    } else {
      if (MFDTask.taskID !== taskID || MFDTask.result === undefined) {
        setMFDTask({
          ...MFDAtomDefaultValuesWithParams(
            taskID,
            clusterIndex,
            limit,
            sortBy
          ),
        });
      }
    }
  }, [loading, error, data, setMFDTask, clusterIndex, taskID, limit]);

  return {
    data:
      MFDTask.taskID === taskID
        ? MFDTask
        : MFDAtomDefaultValuesWithParams(taskID, clusterIndex, limit),
    loading: loading || MFDTask.taskID !== taskID,
    error,
  };
};

export default useMFDTask;
