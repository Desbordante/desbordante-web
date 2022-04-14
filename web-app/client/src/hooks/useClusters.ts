import {useCallback, useContext, useEffect, useRef, useState} from "react";
import { useLazyQuery, useMutation } from "@apollo/client";

import {Cluster, ClustersInfo} from "../types/primitives";
import {
  getClustersPreview_taskInfo_data_result_TypoClusterTaskResult,
  getClustersPreviewVariables,
  getClustersPreview,
} from "../graphql/operations/queries/EDP/__generated__/getClustersPreview";
import { GET_CLUSTERS_PREVIEW } from "../graphql/operations/queries/EDP/getClustersPreview";
import {
  createClustersPreview,
  createClustersPreviewVariables,
} from "../graphql/operations/mutations/__generated__/createClustersPreview";
import { CREATE_CLUSTERS_PREVIEW } from "../graphql/operations/mutations/createClustersPreview";
import { dependencyToAttributeIds } from "../functions/primitives";
import { ErrorContext } from "../components/ErrorContext";
import { TaskContext } from "../components/TaskContext";
import { FunctionalDependency } from "../types/taskInfo";

export const useClusters = (selectedDependency?: FunctionalDependency) => {
  const { showError } = useContext(ErrorContext)!;
  const { taskId } = useContext(TaskContext)!;

  const [clusters, setClusters] =
    useState<ClustersInfo>();
  const [typoTaskId, setTypoTaskId] = useState<string>();

  const setCluster = useCallback((clusterId: number, newCluster: Cluster) =>
    setClusters((prev) => {
      if (!prev) {
        return prev;
      }
      const newClusters = [...prev.TypoClusters];
      newClusters[clusterId] = newCluster;
      return { ...prev, TypoClusters: newClusters };
    }), []);

  const queryRef = useRef<NodeJS.Timer | null>(null);

  const [getClustersPreview] = useLazyQuery<
    getClustersPreview,
    getClustersPreviewVariables
  >(GET_CLUSTERS_PREVIEW);
  const [createPreviewTask] = useMutation<
    createClustersPreview,
    createClustersPreviewVariables
  >(CREATE_CLUSTERS_PREVIEW);

  useEffect(() => {
    setClusters(undefined);
    if (!selectedDependency) {
      return;
    }
    const createTask = async () => {
      try {
        if (taskId) {
          const res = await createPreviewTask({
            variables: {
              taskId,
              typoFD: dependencyToAttributeIds(selectedDependency),
            },
          });
          setTypoTaskId(res.data?.createTypoMinerTask.taskID || "");
        }
      } catch (error: any) {
        showError(error);
      }
    };

    createTask();
  }, [createPreviewTask, selectedDependency, showError, taskId]);

  const stopPolling = () => {
    if (queryRef.current) {
      clearInterval(queryRef.current);
      queryRef.current = null;
    }
  };

  useEffect(() => {
    if (!queryRef.current && typoTaskId) {
      queryRef.current = setInterval(async () => {
        try {
          const res = await getClustersPreview({
            variables: {
              taskId: typoTaskId,
              pagination: { offset: 0, limit: 100 },
            },
          });
          const dataResult = res.data?.taskInfo.data
            .result as getClustersPreview_taskInfo_data_result_TypoClusterTaskResult;
          if (dataResult) {
            setClusters(dataResult);
          }
        } catch (error: any) {
          showError(error);
          stopPolling();
        }
      }, 1000);
    }

    return stopPolling;
  }, [typoTaskId]);

  useEffect(() => {
    if (clusters?.TypoClusters) {
      stopPolling();
    }
  }, [clusters]);

  return {clusters, setCluster};
};
