// hooks
import { useLazyQuery, useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
// MFD Task Atom with data from the server
import MFDAtom, {
  MFDAtomDefaultValues,
  MFDAtomDefaultValuesWithParams,
} from '@atoms/MFDTaskAtom';
// queries
import {
  GetMFDTaskData,
  GetMFDTaskDataVariables,
} from '@graphql/operations/queries/__generated__/GetMFDTaskData';
import { GET_MFD_TASK_DATA } from '@graphql/operations/queries/getMFDTaskData';
// error message
import { showError } from '@utils/toasts';
import { MFDSortBy } from 'types/globalTypes';

const useMFDTask = (
  taskID: string,
  clusterIndex = 0,
  offset = 0,
  limit = 150,
  sortBy = MFDSortBy.FURTHEST_POINT_INDEX
) => {
  // MFD Task Atom
  const [MFDTask, setMFDTask] = useAtom(MFDAtom);
  // Query
  const [loadMFDData, { loading, error, data }] = useLazyQuery<
    GetMFDTaskData,
    GetMFDTaskDataVariables
  >(GET_MFD_TASK_DATA, {
    variables: {
      taskID: taskID,
      clusterIndex: clusterIndex,
      offset: offset,
      limit: limit,
      sortBy: sortBy,
    },
    onError: (error) => {
      showError(error.message, "Can't fetch task data. Please try later.");
    },
  });

  useEffect(() => {
    if (
      !(
        MFDTask.taskID === taskID &&
        MFDTask.clusterIndex === clusterIndex &&
        MFDTask.pagination.offset === offset &&
        MFDTask.pagination.limit === limit &&
        MFDTask.sortBy === sortBy &&
        MFDTask.result !== undefined
      )
    ) {
      loadMFDData();
    }
  }, []);

  // Fill MFD Task Atom with data from the server
  useEffect(() => {
    // when data is loaded, update storage
    if (
      data?.taskInfo !== undefined &&
      'data' in data?.taskInfo &&
      data?.taskInfo.data?.result !== null &&
      'result' in data?.taskInfo.data?.result
    ) {
      const taskData = data?.taskInfo.data?.result;
      // shortening the name /\
      setMFDTask({
        // if taskData is correct, set the atom
        ...MFDAtomDefaultValuesWithParams(
          taskID,
          clusterIndex,
          offset,
          limit,
          sortBy
        ),
        result: taskData?.result || false,
        clustersTotalCount: taskData?.clustersTotalCount || 0,
        cluster: {
          value: taskData?.cluster?.value || '',
          highlightsTotalCount: taskData?.cluster?.highlightsTotalCount || 0,
          highlights: (taskData?.cluster?.highlights || []).map(
            (highlight, index) => ({ ...highlight, rowIndex: index + offset })
          ),
        },
      });
    } else {
      // if task didn't change, don't erase the data only update it
      if (MFDTask.taskID !== taskID || MFDTask.result === undefined) {
        // if taskData is incorrect, set default values
        setMFDTask({
          ...MFDAtomDefaultValuesWithParams(
            taskID,
            clusterIndex,
            offset,
            limit,
            sortBy
          ),
        });
      }
    }
  }, [loading, error, data, setMFDTask, clusterIndex, taskID, offset, limit]);

  return {
    data:
      MFDTask.taskID === taskID
        ? MFDTask
        : MFDAtomDefaultValuesWithParams(taskID, clusterIndex, offset, limit),
    loading: loading || MFDTask.taskID !== taskID,
    error,
  };
};

export default useMFDTask;
