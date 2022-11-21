import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { Column } from '@graphql/operations/fragments/__generated__/Column';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';

export type DepAttribute = {
  column: Column;
  value: number;
};
type DependencyFilter = { rhs: number[]; lhs: number[] };
export type TaskContentType = {
  taskInfo?: getTaskInfo;
  taskID: string;
  dependenciesFilter: DependencyFilter;
  setDependenciesFilter: Dispatch<SetStateAction<DependencyFilter>>;
};

export const TaskContext = createContext<TaskContentType | null>(null);

export const TaskContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [dependenciesFilter, setDependenciesFilter] =
    useState<DependencyFilter>({
      rhs: [],
      lhs: [],
    });
  const router = useRouter();
  const taskID = router.query.taskID as string;
  const { data: taskInfo } = useQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO,
    {
      variables: { taskID },
    }
  );

  return (
    <TaskContext.Provider
      value={{ taskInfo, taskID, dependenciesFilter, setDependenciesFilter }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('Cannot use task context');
  }
  return ctx;
};
