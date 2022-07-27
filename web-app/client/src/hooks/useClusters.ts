import { useContext, useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";

import {
  getClustersPreview,
  getClustersPreviewVariables,
} from "../graphql/operations/queries/EDP/__generated__/getClustersPreview";
import { GET_CLUSTERS_PREVIEW } from "../graphql/operations/queries/EDP/getClustersPreview";
import { dependencyToAttributeIds } from "../functions/primitives";
import { ErrorContext } from "../components/ErrorContext";
import { TaskContext } from "../components/TaskContext";
import { GET_SPECIFIC_CLUSTER } from "../graphql/operations/queries/EDP/getSpecificCluster";
import {
  getSpecificCluster,
  getSpecificClusterVariables,
} from "../graphql/operations/queries/EDP/__generated__/getSpecificCluster";
import { FD } from "../graphql/operations/fragments/__generated__/FD";
import {
  createSpecificTask,
  createSpecificTaskVariables
} from "../graphql/operations/mutations/__generated__/createSpecificTask";
import { CREATE_SPECIFIC_TASK } from "../graphql/operations/mutations/createSpecificTask";
import { SpecificTaskType } from "../types/globalTypes";
import { GET_TASK_INFO } from "../graphql/operations/queries/getTaskInfo";
import { getTaskState, getTaskStateVariables } from "../graphql/operations/queries/__generated__/getTaskState";
import { ClustersInfo, SpecificCluster } from "../types/primitives";

// TODO: WIP
export const useClusters = (selectedDependency?: FD) => {
  const { showError } = useContext(ErrorContext)!;
  const { taskId } = useContext(TaskContext)!;

  const [clusters, setClusters] = useState<ClustersInfo>();
  const [typoTaskId, setTypoTaskId] = useState<string>();

  const previewTaskRef = useRef<NodeJS.Timer | null>(null);
  type SpecificClusterInfo = { clusterID: number, typoTaskID: string };
  const specificTasksPull = useRef<
    (SpecificClusterInfo & { /* parentTaskId: string; */ timer: NodeJS.Timer })[]
  >([]);

  const [getClusters] = useLazyQuery<
    getClustersPreview,
    getClustersPreviewVariables
  >(GET_CLUSTERS_PREVIEW, {fetchPolicy: "network-only"});
  const [createClusters] = useMutation<
    createSpecificTask,
    createSpecificTaskVariables
  >(CREATE_SPECIFIC_TASK, {fetchPolicy: "network-only"});

  const [getSpecificCluster] = useLazyQuery<
    getSpecificCluster,
    getSpecificClusterVariables
  >(GET_SPECIFIC_CLUSTER, {fetchPolicy: "network-only"});

  // @ts-ignore
  const setClusterTask = (
    id: number,
    action: (prev: SpecificCluster) => SpecificCluster
  ) =>
    setClusters(
      (prev) =>
        prev
        // && {
        //   ...prev,
        //   typoClusters: prev.typoClusters.map((cluster) =>
        //     cluster.id === id ? action(cluster) : cluster
        //   ),
        // }
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
          const res = await createClusters({
            variables: {
              props: {
                algorithmName: "Typo Miner",
                type: SpecificTaskType.TypoCluster,
                parentTaskID: taskId,
                typoFD: dependencyToAttributeIds(selectedDependency),
              }
            },
          });
          setTypoTaskId(res.data?.createSpecificTask.taskID || "");
          if (res.errors) {
            throw new Error("Cannot calculate clusters for this dependency");
          }
        }
      } catch (error: any) {
        showError(error);
      }
    };

    createTask();
  }, [createClusters, selectedDependency, showError, taskId]);

  const stopPolling = () => {
    if (previewTaskRef.current) {
      clearInterval(previewTaskRef.current);
      previewTaskRef.current = null;
    }
  };

  const [getTaskStateQuery] = useLazyQuery<getTaskState, getTaskStateVariables>(
    GET_TASK_INFO,
    {
      fetchPolicy: "network-only"
    }
  );

  useEffect(() => {
    if (!previewTaskRef.current && typoTaskId) {
      previewTaskRef.current = setInterval(async () => {
        try {
          const stateInfo = await getTaskStateQuery({
            variables: {
              taskID: typoTaskId,
            }
          })
          if (!stateInfo.data) {
            throw new Error("Internal server error");
          }
          const {state} = stateInfo.data.taskInfo;

          if (state.__typename !== "TaskState") {
            throw new Error(state.errorStatus);
          }
          if (!state.isExecuted) {
            return;
          }
          stopPolling();

          const clustersInfo = await getClusters({
            variables: {
              taskId: typoTaskId,
              clustersPagination: { offset: 0, limit: 5},
              itemsLimit: 10,
            },
          });
          const { data } = clustersInfo;
          if (!data) {
            throw new Error("Internal server error")
          }
          const { taskInfo } = data;
          if (taskInfo.__typename !== "SpecificTaskInfo"
            || taskInfo.data.__typename !== "SpecificTaskData"
            || taskInfo.data.result == null) {
            throw new Error("Internal server error");
          }
          const { result } = taskInfo.data;
          const { clustersCount, typoClusters } = result;
          setClusters({
            clustersCount,
            typoClusters: typoClusters.map((cluster) => ({
              data: {cluster},
              loading: false,
              error: false,
              isSorted: true,
              id: cluster.clusterID,
            })),
          })
        } catch (error: any) {
          showError(error);
          stopPolling();
        }
      }, 500);
    }

    return stopPolling;
  }, [typoTaskId]);

  const stopPollingSpecificTask = (clusterInfo: SpecificClusterInfo) => {
    const { current: pull } = specificTasksPull;
    const found = pull.find(({typoTaskID, clusterID}) => clusterInfo.typoTaskID === typoTaskID && clusterInfo.clusterID === clusterID);
    if (found) {
      clearInterval(found.timer);
    }
  };

  const pollSpecificTask =
    (info: SpecificClusterInfo, sort: boolean, squash: boolean) => async () => {
    const {typoTaskID, clusterID} = info;
    try {
        const res = await getSpecificCluster({
          variables: {
            props: {
              sort,
              squash,
              clusterID,
            },
            taskId: typoTaskID,
            pagination: { offset: 0, limit: 100 },
          },
        });
        const taskInfoData = res.data?.taskInfo.data;
        if (taskInfoData?.__typename !== "SpecificTaskData" || taskInfoData.result == null) {
          throw Error("Received undefined result or incorrect data");
        }
        const {result} = taskInfoData;
        if (result) {
          setClusterTask(clusterID, (prev) => ({
            ...prev,
            loading: false,
            data: result.specificCluster,
          }));
          stopPollingSpecificTask(info);
        }
      } catch (error: any) {
        showError(error);
        stopPollingSpecificTask(info);
      }
    };

  const setClusterSorted = (clusterId: number, isSorted: boolean) => {
    const isSquashed = false;
    setClusters((prev) => {
      if (prev && prev.typoClusters) {
        const newClusters = {...prev};
        newClusters.typoClusters.find(({id}) => id === clusterId)!.isSorted =
          isSorted;
        return newClusters;
      }
      return undefined;
    });
    const { current: pull } = specificTasksPull;
    const found = pull.find(({ clusterID: id }) => id === clusterId);
    if (found) {
      clearInterval(found.timer);
      found.timer = setInterval(pollSpecificTask({ ...found }, isSorted, isSquashed), 1000);
    }
  }

  const startSpecificTask = async (clusterID: number) => {
    const { current: pull } = specificTasksPull;
    const found = pull.find(({ clusterID: id }) => id === clusterID);

    if (!found) {
      try {
        if (typoTaskId) {
          pull.push({
            typoTaskID: typoTaskId,
            clusterID,
            timer: setInterval(pollSpecificTask({typoTaskID: typoTaskId, clusterID}, true, false), 1000),
          });
          setClusterTask(clusterID, (prev) => ({
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
