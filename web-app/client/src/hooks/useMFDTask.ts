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
import { MFDSortBy, OrderBy } from 'types/globalTypes';

// removing offset because it's hard to implement scrolling up and I have no time to make scrolling anchoring with code

const useMFDTask = (
  taskID: string,
  clusterIndex = 0,
  //offset = 0,
  limit = 150,
  sortBy = MFDSortBy.POINT_INDEX,
  orderBy = OrderBy.ASC
) => {
  // MFD Task Atom
  const [MFDTask, setMFDTask] = useAtom(MFDAtom);
  // Query
  const [loadMFDData, { loading, error, data }] = useLazyQuery<
    GetMFDTaskData,
    GetMFDTaskDataVariables
  >(GET_MFD_TASK_DATA, {
    variables: {
      // TODO: figure out how to add new data to old one
      taskID: taskID,
      clusterIndex: clusterIndex,
      offset: 0,
      limit: limit,
      sortBy: sortBy,
      orderBy: orderBy,
    },
    onError: (error) => {
      console.error(error);
      showError(error.message, "Can't fetch task data. Please try later.");
    },
  });

  useEffect(() => {
    if (
      !(
        MFDTask.taskID === taskID &&
        MFDTask.clusterIndex === clusterIndex &&
        MFDTask.pagination.limit === limit &&
        MFDTask.sortBy === sortBy &&
        MFDTask.result !== undefined
      )
    ) {
      loadMFDData().then();
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
          0,
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
            (highlight, index) => ({ ...highlight, rowIndex: index + 0 })
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
            0,
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
        : MFDAtomDefaultValuesWithParams(taskID, clusterIndex, 0, limit),
    loading: loading || MFDTask.taskID !== taskID,
    error,
  };
};

export default useMFDTask;
