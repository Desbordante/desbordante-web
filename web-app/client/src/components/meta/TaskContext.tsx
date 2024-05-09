import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Column } from '@graphql/operations/fragments/__generated__/Column';
import {
  createSpecificTask,
  createSpecificTaskVariables,
} from '@graphql/operations/mutations/__generated__/createSpecificTask';
import { CREATE_SPECIFIC_TASK } from '@graphql/operations/mutations/createSpecificTask';
import {
  getDataset,
  getDatasetVariables,
} from '@graphql/operations/queries/__generated__/getDataset';
import {
  getTaskInfo,
  getTaskInfoVariables,
} from '@graphql/operations/queries/__generated__/getTaskInfo';
import { GET_DATASET } from '@graphql/operations/queries/getDataset';
import { GET_TASK_INFO } from '@graphql/operations/queries/getTaskInfo';
import useClustersPreview from '@hooks/useClustersPreview';
import { useErrorContext } from '@hooks/useErrorContext';
import { GeneralColumn } from '@utils/convertDependencies';
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
  errorDependency: GeneralColumn[];
  selectDependency: Dispatch<SetStateAction<GeneralColumn[]>>;
  specificTaskID?: string;
  datasetHeader?: string[];
  clusterIsBeingProcessed: boolean;
};

export const TaskContext = createContext<TaskContentType | null>(null);

export const TaskContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [dependenciesFilter, setDependenciesFilter] =
    useState<DependencyFilter>({
      rhs: [],
      lhs: [],
    });
  const [selectedDependency, selectDependency] = useState<GeneralColumn[]>([]);
  const [errorDependency, setErrorDependecy] = useState<GeneralColumn[]>([]);
  const [specificTaskID, setSpecificTaskID] = useState<string | undefined>();
  const router = useRouter();
  const taskID = router.query.taskID as string;

  const { showError } = useErrorContext();
  const { data: taskInfo } = useQuery<getTaskInfo, getTaskInfoVariables>(
    GET_TASK_INFO,
    {
      variables: { taskID },
    },
  );

  const { data: datasetInfo } = useQuery<getDataset, getDatasetVariables>(
    GET_DATASET,
    {
      variables: { taskID, pagination: { offset: 0, limit: 1 } },
    },
  );

  const datasetHeader = datasetInfo?.taskInfo.dataset?.snippet.header;

  const {
    miningCompleted,
    data: clusterPreviewData,
    loading: clusterPreviewLoading,
    error: clusterPreviewError,
  } = useClustersPreview(specificTaskID, 1);

  const [
    createSpecificTask,
    { data: clusterTaskResponse, loading: miningTaskLoading },
  ] = useMutation<createSpecificTask, createSpecificTaskVariables>(
    CREATE_SPECIFIC_TASK,
  );
  const clusterIsBeingProcessed =
    miningTaskLoading ||
    clusterPreviewLoading ||
    (!!clusterPreviewData && !miningCompleted && !clusterPreviewError);
  // if we are creating task, or loading preview or we loaded preview and there is no results and errors

  useEffect(() => {
    if (
      selectedDependency.length === 0 ||
      clusterIsBeingProcessed ||
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDependency]);

  useEffect(() => {
    if (errorDependency) {
      const timer = setTimeout(() => setErrorDependecy([]), 5000);
      return () => clearInterval(timer);
    }
  }, [errorDependency]);

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
        errorDependency,
        selectedDependency,
        selectDependency: (e) => {
          if (clusterIsBeingProcessed) {
            showError({
              message: 'Another discovering task is in progress',
            });
            setErrorDependecy(e);
          } else {
            selectDependency(e);
          }
        },
        specificTaskID,
        datasetHeader: datasetHeader || undefined,
        clusterIsBeingProcessed,
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
