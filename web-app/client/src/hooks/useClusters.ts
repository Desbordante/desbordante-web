import { useContext, useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";

import { ClustersInfo, ClusterTask } from "../types/primitives";
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
import {
  createDedicatedClusterTask,
  createDedicatedClusterTaskVariables,
} from "../graphql/operations/mutations/__generated__/createDedicatedClusterTask";
import { CREATE_DEDICATED_CLUSTER_TASK } from "../graphql/operations/mutations/createDedicatedClusterTask";
import { GET_SPECIFIC_CLUSTER } from "../graphql/operations/queries/EDP/getSpecificCluster";
import {
  getSpecificCluster,
  getSpecificCluster_taskInfo_data_result_SpecificTypoClusterTaskResult,
  getSpecificClusterVariables,
} from "../graphql/operations/queries/EDP/__generated__/getSpecificCluster";

export const useClusters = (selectedDependency?: FunctionalDependency) => {
  const { showError } = useContext(ErrorContext)!;
  const { taskId } = useContext(TaskContext)!;

  const [clusters, setClusters] = useState<ClustersInfo>();
  const [typoTaskId, setTypoTaskId] = useState<string>();

  const previewTaskRef = useRef<NodeJS.Timer | null>(null);
  const specificTasksPull = useRef<
    { clusterId: number; specificTaskId: string; timer: NodeJS.Timer }[]
  >([]);

  const [getClustersPreview] = useLazyQuery<
    getClustersPreview,
    getClustersPreviewVariables
  >(GET_CLUSTERS_PREVIEW, {fetchPolicy: "network-only"});
  const [createPreviewTask] = useMutation<
    createClustersPreview,
    createClustersPreviewVariables
  >(CREATE_CLUSTERS_PREVIEW);
  const [createDedicatedClusterTask] = useMutation<
    createDedicatedClusterTask,
    createDedicatedClusterTaskVariables
  >(CREATE_DEDICATED_CLUSTER_TASK);
  const [getSpecificCluster] = useLazyQuery<
    getSpecificCluster,
    getSpecificClusterVariables
  >(GET_SPECIFIC_CLUSTER, {fetchPolicy: "network-only"});

  const setClusterTask = (
    id: number,
    action: (prev: ClusterTask) => ClusterTask
  ) =>
    setClusters(
      (prev) =>
        prev && {
          ...prev,
          TypoClusters: prev.TypoClusters.map((cluster) =>
            cluster.id === id ? action(cluster) : cluster
          ),
        }
    );

  useEffect(() => {
    setTypoTaskId(undefined);
    specificTasksPull.current = [];
  }, [selectedDependency]);

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
    if (previewTaskRef.current) {
      clearInterval(previewTaskRef.current);
      previewTaskRef.current = null;
    }
  };

  useEffect(() => {
    if (!previewTaskRef.current && typoTaskId) {
      previewTaskRef.current = setInterval(async () => {
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
            setClusters({
              clustersCount: dataResult.clustersCount,
              TypoClusters: dataResult.TypoClusters.map((cluster) => ({
                data: { cluster },
                loading: false,
                error: false,
                isSorted: true,
                id: cluster.id,
              })),
            });
            stopPolling();
          }
        } catch (error: any) {
          showError(error);
          stopPolling();
        }
      }, 1000);
    }

    return stopPolling;
  }, [typoTaskId]);

  const stopPollingSpecificTask = (specificTaskId: string) => {
    const { current: pull } = specificTasksPull;
    const found = pull.find(({ specificTaskId: id }) => id === specificTaskId);
    if (found) {
      clearInterval(found.timer);
      // specificTasksPull.current = pull.filter((element) => element !== found);
    }
  };

  const pollSpecificTask =
    (specificTaskId: string, sort: boolean) => async () => {
      try {
        const res = await getSpecificCluster({
          variables: {
            taskId: specificTaskId,
            pagination: { offset: 0, limit: 100 },
            sort,
          },
        });
        const dataResult = res.data?.taskInfo.data
          .result as getSpecificCluster_taskInfo_data_result_SpecificTypoClusterTaskResult;
        if (dataResult) {
          setClusterTask(dataResult.cluster.id, (prev) => ({
            ...prev,
            loading: false,
            data: dataResult,
          }));
          stopPollingSpecificTask(specificTaskId);
        }
      } catch (error: any) {
        showError(error);
        stopPollingSpecificTask(specificTaskId);
      }
    };

  const setClusterSorted = (clusterId: number, isSorted: boolean) => {
    setClusters((prev) => {
      if (prev && prev.TypoClusters) {
        const newClusters = {...prev};
        newClusters.TypoClusters.find(({id}) => id === clusterId)!.isSorted =
          isSorted;
        return newClusters;
      }
      return undefined;
    });
    const { current: pull } = specificTasksPull;
    const found = pull.find(({ clusterId: id }) => id === clusterId);
    if (found) {
      clearInterval(found.timer);
      found.timer = setInterval(pollSpecificTask(found.specificTaskId, isSorted), 1000);
    }
  }

  const startSpecificTask = async (clusterId: number) => {
    const { current: pull } = specificTasksPull;
    const found = pull.find(({ clusterId: id }) => id === clusterId);

    if (!found) {
      try {
        if (typoTaskId) {
          const res = await createDedicatedClusterTask({
            variables: { taskId: typoTaskId, clusterId },
          });
          const specificTaskId = res.data?.createTypoMinerTask.taskID;
          if (specificTaskId) {
            pull.push({
              specificTaskId,
              clusterId,
              timer: setInterval(pollSpecificTask(specificTaskId, true), 1000),
            });
          }
          setClusterTask(clusterId, (prev) => ({
            ...prev,
            loading: true,
          }));
        }
      } catch (error: any) {
        showError(error);
      }
    }
  };

  return { clusters, startSpecificTask, setClusterSorted };
};
