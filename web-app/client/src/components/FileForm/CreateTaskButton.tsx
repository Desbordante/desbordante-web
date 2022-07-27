import React, { useContext } from "react";
import { DefaultContext, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { CREATE_TASK_WITH_UPLOADING_DATASET } from "../../graphql/operations/mutations/createTask";
import { CREATE_TASK_WITH_CHOOSING_DATASET } from "../../graphql/operations/mutations/chooseTask";
import { FileFormContext } from "../FileFormContext";
import { ErrorContext } from "../ErrorContext";
import { isBuiltinDataset } from "../../types/dataset";
import { FileProps, IntersectionMainTaskProps } from "../../types/globalTypes";
import {
  createTaskWithDatasetChoosing,
  createTaskWithDatasetChoosingVariables,
} from "../../graphql/operations/mutations/__generated__/createTaskWithDatasetChoosing";
import { AllowedDataset } from "../../types/types";
import {
  createMainTaskWithDatasetUploading,
  createMainTaskWithDatasetUploadingVariables
} from "../../graphql/operations/mutations/__generated__/createMainTaskWithDatasetUploading";

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
  const {
    isValid,
    dataset,
    fileProps,
    algorithmProps,
    setFileUploadProgress,
    primitiveType,
  } = useContext(FileFormContext)!;
  const { showError } = useContext(ErrorContext)!;
  const history = useHistory();

  const [createTask] = useMutation<
    createMainTaskWithDatasetUploading,
    createMainTaskWithDatasetUploadingVariables
  >(CREATE_TASK_WITH_UPLOADING_DATASET);
  const [chooseTask] = useMutation<
    createTaskWithDatasetChoosing,
    createTaskWithDatasetChoosingVariables
  >(CREATE_TASK_WITH_CHOOSING_DATASET);

  const submit = () => {
    if (isValid) {
      const props: IntersectionMainTaskProps = {
        algorithmName: algorithmProps.algorithm!.name,
        type: primitiveType,
        errorThreshold: algorithmProps.algorithm!.properties.hasErrorThreshold
          ? +algorithmProps.errorThreshold!
          : 0,
        maxLHS: algorithmProps.algorithm!.properties.hasArityConstraint
          ? +algorithmProps.arityConstraint!
          : -1,
        threadsCount: algorithmProps.algorithm!.properties.isMultiThreaded
          ? +algorithmProps.threadsCount!
          : 1,
        minConfidence: +algorithmProps.minConfidence!,
        minSupportAR: +algorithmProps.minSupportAR!,
        minSupportCFD: +algorithmProps.minSupportCFD!,
        preciseAlgorithm: algorithmProps.preciseAlgorithm?.name,
        approximateAlgorithm: algorithmProps.approximateAlgorithm?.name,
        metric: algorithmProps.metric,
        defaultRadius: +algorithmProps.defaultRadius!,
        defaultRatio: +algorithmProps.defaultRatio!,
      };
      const datasetProps: FileProps = {
        delimiter: fileProps.delimiter,
        hasHeader: fileProps.hasHeader,
        inputFormat: fileProps.fileFormat,
        hasTid: fileProps.hasTransactionId,
        tidColumnIndex: +fileProps.transactionIdColumn,
        itemColumnIndex: +fileProps.itemSetColumn,
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
          variables: { props, fileID: (dataset as AllowedDataset).fileID, forceCreate: true },
          context,
        })
          .then((res) =>
            history.push(res.data?.createMainTaskWithDatasetChoosing.taskID)
          )
          .catch((error) => showError({ message: error.message }))
          .finally(() => setFileUploadProgress(0));
      } else {
        createTask({
          variables: { props, datasetProps, table: dataset as File },
          context,
        })
          .then((res) =>
            history.push(res.data?.createMainTaskWithDatasetUploading.taskID)
          )
          .catch((error) => showError({ message: error.message }))
          .finally(() => setFileUploadProgress(0));
      }
    }
  };

  return (
    <SubmitButton
      onClick={isValid ? submit : () => {}}
      className={`rounded-pill my-5 px-4 py-2 fs-4 text-${
        isValid ? "primary" : "grey"
      } border border-2 border-${isValid ? "primary" : "lighter-dark"}`}
      style={{ pointerEvents: isValid ? "auto" : "none" }}
    >
      Analyze
    </SubmitButton>
  );
};

export default CreateTaskButton;
