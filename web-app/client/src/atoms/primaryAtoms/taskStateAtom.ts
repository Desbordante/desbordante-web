import { atom } from 'jotai';
import { getTaskState_taskInfo_state } from '@graphql/operations/queries/__generated__/getTaskState';
import { getTaskStateLite_taskInfo_state } from '@graphql/operations/queries/__generated__/getTaskStateLite';
import { TaskProcessStatusType } from 'types/globalTypes';

export type TaskState =
  | getTaskStateLite_taskInfo_state
  | getTaskState_taskInfo_state;

export type TaskStateAtom = {
  taskID: string;
  algorithmName: string;
  type: string;
  state: TaskState;
};

export const taskStateAtomDefaultValues: TaskStateAtom = {
  taskID: '',
  algorithmName: '',
  type: '',
  state: {
    __typename: 'TaskState',
    isPrivate: false,
    attemptNumber: 0,
    processStatus: TaskProcessStatusType.ADDED_TO_THE_TASK_QUEUE,
    phaseName: null,
    currentPhase: null,
    progress: 0,
    maxPhase: null,
    isExecuted: false,
    elapsedTime: null,
  },
};

export const taskStateAtomDefaultValuesWithID = (taskID: string) => ({
  ...taskStateAtomDefaultValues,
  taskID,
});

const taskStateAtom = atom<TaskStateAtom>(taskStateAtomDefaultValues);

export default taskStateAtom;
