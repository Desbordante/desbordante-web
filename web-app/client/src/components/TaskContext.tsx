import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Column } from '@graphql/operations/fragments/__generated__/Column';
import { CREATE_SPECIFIC_TASK } from '@graphql/operations/mutations/createSpecificTask';
import {
  createSpecificTask,
  createSpecificTaskVariables,
} from '@graphql/operations/mutations/__generated__/createSpecificTask';
import { GET_DATASET } from '@graphql/operations/queries/getDataset';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import {
  getDataset,
  getDatasetVariables,
} from '@graphql/operations/queries/__generated__/getDataset';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { GeneralColumn } from '@utils/convertDependencies';
import { useRouter } from 'next/router';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { PrimitiveType, SpecificTaskType } from 'types/globalTypes';

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
  selectedDependency: GeneralColumn[];
  selectDependency: Dispatch<SetStateAction<GeneralColumn[]>>;
  specificTaskID?: string;
  datasetHeader?: string[];
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
  const [selectedDependency, selectDependency] = useState<GeneralColumn[]>([]);
  const [specificTaskID, setSpecificTaskID] = useState<string | undefined>();
  const router = useRouter();
  const taskID = router.query.taskID as string;
  const { data: taskInfo } = useQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO,
    {
      variables: { taskID },
    }
  );

  const { data: datasetInfo } = useQuery<getDataset, getDatasetVariables>(
    GET_DATASET,
    {
      variables: { taskID, pagination: { offset: 0, limit: 1 } },
    }
  );

  const datasetHeader = datasetInfo?.taskInfo.dataset?.snippet.header;

  const [createSpecificTask, { data: clusterTaskResponse }] = useMutation<
    createSpecificTask,
    createSpecificTaskVariables
  >(CREATE_SPECIFIC_TASK);

  useEffect(() => {
    if (
      selectedDependency.length === 0 ||
      typeof specificTaskID !== 'undefined' ||
      taskInfo?.taskInfo.data.baseConfig.type !== PrimitiveType.TypoFD
    ) {
      return;
    }
    createSpecificTask({
      variables: {
        props: {
          algorithmName: 'Typo Miner',
          type: SpecificTaskType.TypoCluster,
          parentTaskID: taskID,
          typoFD: selectedDependency.map((e) => e.column.index),
        },
      },
    });
  }, [selectedDependency]);

  useEffect(() => {
    if (clusterTaskResponse) {
      setSpecificTaskID(clusterTaskResponse.createSpecificTask.taskID);
    }
  }, [clusterTaskResponse]);

  return (
    <TaskContext.Provider
      value={{
        taskInfo,
        taskID,
        dependenciesFilter,
        setDependenciesFilter,
        selectedDependency,
        selectDependency,
        specificTaskID,
        datasetHeader: datasetHeader || undefined,
      }}
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
