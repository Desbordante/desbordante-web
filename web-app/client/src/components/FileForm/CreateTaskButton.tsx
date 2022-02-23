import React, { useContext, useEffect } from "react";
import { DefaultContext, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import { CREATE_FD_TASK } from "../../graphql/operations/mutations/createFDTask";
import { CHOOSE_FD_TASK } from "../../graphql/operations/mutations/chooseFDTask";
import Button from "../Button/Button";
import { FileFormContext } from "../FileFormContext";
import { ErrorContext } from "../ErrorContext";
import { FDTaskProps, FileProps } from "../../../__generated__/globalTypes";
import { BuiltinDataset, isBuiltinDataset } from "../../types/dataset";

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
  ] = useMutation(CREATE_FD_TASK);
  const [
    chooseTask,
    {
      data: chooseTaskData,
      loading: chooseTaskLoading,
      error: chooseTaskError,
    },
  ] = useMutation(CHOOSE_FD_TASK);
  const data =
    (createTaskData && createTaskData.createFDTask) ||
    (chooseTaskData && chooseTaskData.chooseFDTask);
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
      const props: FDTaskProps = {
        algorithmName: algorithmProps.algorithm!.name,
        errorThreshold: algorithmProps.algorithm!.properties.hasErrorThreshold
          ? +algorithmProps.errorThreshold!
          : 0,
        maxLHS: algorithmProps.algorithm!.properties.hasArityConstraint
          ? +algorithmProps.arityConstant!
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
          variables: {
            props,
            datasetProps,
            table: dataset as File,
          },
          context,
        });
      }
    }
  };

  return (
    <Button enabled={isValid && !loading} onClick={submit} variant="primary">
      Analyze
    </Button>
  );
};

export default CreateTaskButton;
