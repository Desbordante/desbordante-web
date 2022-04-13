import React, { useContext, useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CLUSTERS_PREVIEW } from "../../../graphql/operations/queries/EDP/getClustersPreview";
import {
  getClustersPreview,
  getClustersPreview_taskInfo_data_result_TypoClusterTaskResult,
  getClustersPreviewVariables,
} from "../../../graphql/operations/queries/EDP/__generated__/getClustersPreview";
import { CREATE_CLUSTERS_PREVIEW } from "../../../graphql/operations/mutations/createClustersPreview";
import {
  createClustersPreview,
  createClustersPreviewVariables,
} from "../../../graphql/operations/mutations/__generated__/createClustersPreview";
import { TaskContext } from "../../TaskContext";
import { ErrorContext } from "../../ErrorContext";
import Cluster from "./Cluster";
import { FunctionalDependency } from "../../../types/taskInfo";
import { dependencyToAttributeIds } from "../../../functions/primitives";
import LoadingContainer from "../../LoadingContainer/LoadingContainer";

interface Props {
  selectedDependency: FunctionalDependency;
}

const EDPClusters: React.FC<Props> = ({ selectedDependency }) => {
  const { taskId } = useContext(TaskContext)!;
  const { showError } = useContext(ErrorContext)!;

  const [clustersInfo, setClustersInfo] =
    useState<getClustersPreview_taskInfo_data_result_TypoClusterTaskResult>();
  const [previewTaskId, setPreviewTaskId] = useState<string>();
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
    const createTask = async () => {
      try {
        if (taskId) {
          const res = await createPreviewTask({
            variables: {
              taskId,
              typoFD: dependencyToAttributeIds(selectedDependency),
            },
          });
          setPreviewTaskId(res.data?.createTypoMinerTask.taskID || "");
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
    if (!queryRef.current && previewTaskId) {
      queryRef.current = setInterval(async () => {
        try {
          const res = await getClustersPreview({
            variables: {
              taskId: previewTaskId,
              pagination: { offset: 0, limit: 100 },
            },
          });
          const dataResult = res.data?.taskInfo.data
            .result as getClustersPreview_taskInfo_data_result_TypoClusterTaskResult;
          if (dataResult) {
            setClustersInfo(dataResult);
          }
        } catch (error: any) {
          showError(error);
          stopPolling();
        }
      }, 1000);
    }

    return stopPolling;
  }, [previewTaskId]);

  useEffect(() => {
    if (clustersInfo?.TypoClusters) {
      stopPolling();
    }
  }, [clustersInfo]);

  return (
    <LoadingContainer isLoading={!clustersInfo?.TypoClusters}>
      <>
        {clustersInfo?.TypoClusters.map((cluster) => (
          <>
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
            <Cluster
              selectedDependency={selectedDependency}
              cluster={cluster}
            />
          </>
        ))}
      </>
    </LoadingContainer>
  );
};

export default EDPClusters;
