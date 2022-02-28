import React, { useContext, useEffect } from "react";
import { DefaultContext, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { CREATE_TASK_WITH_UPLOADING_DATASET } from "../../graphql/operations/mutations/createTask";
import { CREATE_TASK_WITH_CHOOSING_DATASET } from "../../graphql/operations/mutations/chooseTask";
import { FileFormContext } from "../FileFormContext";
import { ErrorContext } from "../ErrorContext";
import { BuiltinDataset, isBuiltinDataset } from "../../types/dataset";
import {
  FileProps,
  IntersectionTaskProps,
  PrimitiveType,
} from "../../types/globalTypes";
import {
  createTaskWithDatasetUploading,
  createTaskWithDatasetUploadingVariables,
} from "../../graphql/operations/mutations/__generated__/createTaskWithDatasetUploading";
import {
  createTaskWithDatasetChoosing,
  createTaskWithDatasetChoosingVariables,
} from "../../graphql/operations/mutations/__generated__/createTaskWithDatasetChoosing";

const SubmitButton = styled.button`
  transition: 0.3s;
  background: none;
  outline: none;

  &:hover {
    background: linear-gradient(45deg, #942be6, #7600d1);
    color: white !important;
  }
`;

const CreateTaskButton = () => {
  const { isValid, dataset, fileProps, algorithmProps, setFileUploadProgress } =
    useContext(FileFormContext)!;
  const { showError } = useContext(ErrorContext)!;

  const [
    createTask,
    {
      data: createTaskData,
      loading: createTaskLoading,
      error: createTaskError,
    },
  ] = useMutation<
    createTaskWithDatasetUploading,
    createTaskWithDatasetUploadingVariables
  >(CREATE_TASK_WITH_UPLOADING_DATASET);
  const [
    chooseTask,
    {
      data: chooseTaskData,
      loading: chooseTaskLoading,
      error: chooseTaskError,
    },
  ] = useMutation<
    createTaskWithDatasetChoosing,
    createTaskWithDatasetChoosingVariables
  >(CREATE_TASK_WITH_CHOOSING_DATASET);
  const data =
    (createTaskData && createTaskData.createTaskWithDatasetUploading) ||
    (chooseTaskData && chooseTaskData.createTaskWithDatasetChoosing);

  const loading = createTaskLoading || chooseTaskLoading;
  const error = createTaskError || chooseTaskError;

  const history = useHistory();
  useEffect(() => {
    if (error) {
      showError({ message: error.message });
    }
  }, [error]);
  useEffect(() => {
    if (data) {
      history.push(`/${data.state.taskID}`);
    }
  }, [data]);

  const submit = () => {
    if (isValid) {
      const props: IntersectionTaskProps = {
        algorithmName: algorithmProps.algorithm!.name,
        type: PrimitiveType.FD,
        errorThreshold: algorithmProps.algorithm!.properties.hasErrorThreshold
          ? +algorithmProps.errorThreshold!
          : 0,
        maxLHS: algorithmProps.algorithm!.properties.hasArityConstraint
          ? +algorithmProps.arityConstraint!
          : -1,
        threadsCount: algorithmProps.algorithm!.properties.isMultiThreaded
          ? +algorithmProps.threadsCount!
          : 1,
      };
      const datasetProps: FileProps = {
        delimiter: fileProps.delimiter,
        hasHeader: fileProps.hasHeader,
      };
      const context: DefaultContext = {
        fetchOptions: {
          useUpload: true,
          onProgress: (ev: ProgressEvent) => {
            setFileUploadProgress(ev.loaded / ev.total);
          },
        },
      };
      if (isBuiltinDataset(dataset)) {
        chooseTask({
          variables: { props, fileID: (dataset as BuiltinDataset).ID },
          context,
        });
      } else {
        createTask({
          variables: { props, datasetProps, table: dataset as File },
          context,
        });
      }
    }
  };

  return (
    <SubmitButton
      onClick={isValid ? submit : () => {}}
      className={`rounded-pill mt-auto mb-5 px-4 py-2 fs-4 text-${
        isValid ? "primary" : "grey"
      } border border-2 border-${isValid ? "primary" : "lighter-dark"}`}
      style={{ pointerEvents: isValid ? "auto" : "none" }}
    >
      Analyze
    </SubmitButton>
  );
};

export default CreateTaskButton;
