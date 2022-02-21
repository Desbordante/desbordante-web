import React, { useState, useEffect, useContext } from "react";
import { Container, Row } from "react-bootstrap";
import { DefaultContext, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";

import Value from "../Value/Value";
import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import Slider from "../Slider/Slider";
import UploadFile from "../UploadFile/UploadFile";
import BuiltinDatasetSelector from "../BuiltinDatasetSelector/BuiltinDatasetSelector";
import FormItem from "../FormItem/FormItem";
import { AlgorithmConfigContext } from "../AlgorithmConfigContext";
import { builtinDataset, CFDAlgorithm } from "../../types";
import { CREATE_TASK_WITH_UPLOADING_DATASET } from "../../graphql/operations/mutations/createTask";
import { ErrorContext } from "../ErrorContext";
import { CREATE_TASK_WITH_CHOOSING_DATASET } from "../../graphql/operations/mutations/chooseTask";

interface Props {
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
}

const AssociationRules: React.FC<Props> = ({ setUploadProgress }) => {
  const { allowedValues, validators } = useContext(AlgorithmConfigContext)!;
  const { showError } = useContext(ErrorContext)!;
  const [file, setFile] = useState<File>();
  const [hasHeader, setHasHeader] = useState(true);
  const [separator, setSeparator] = useState<string>(",");
  const [algorithm, setAlgorithm] = useState<CFDAlgorithm>();
  const [minimumConfidence, setMinimumConfidence] = useState("0.05");
  const [maxLHSAttributes, setMaxLHSAttributes] = useState("5");
  const [minimumSupport, setMinimumSupport] = useState("1");

  // Builtin kDatasets
  const [isWindowShown, setIsWindowShown] = useState(false);
  const [builtinDataset, setBuiltinDataset] = useState<builtinDataset>();

  useEffect(() => {
    setAlgorithm(
      allowedValues.allowedAlgorithms &&
        allowedValues.allowedAlgorithms.allowedCFDAlgorithms[0]
    );
  }, [allowedValues]);

  const isValid = () =>
    (!!builtinDataset ||
      (validators.fileExistenceValidator(file) &&
        validators.fileSizeValidator(file) &&
        validators.fileFormatValidator(file))) &&
    validators.separatorValidator(separator) &&
    validators.errorValidator(minimumConfidence) &&
    validators.maxLHSValidator(maxLHSAttributes);

  const [
    createTask,
    {
      data: createTaskData,
      loading: createTaskLoading,
      error: createTaskError,
    },
  ] = useMutation(CREATE_TASK_WITH_UPLOADING_DATASET);
  const [
    chooseTask,
    {
      data: chooseTaskData,
      loading: chooseTaskLoading,
      error: chooseTaskError,
    },
  ] = useMutation(CREATE_TASK_WITH_CHOOSING_DATASET);
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
    // if (isValid()) {
    //   const props: FDTaskProps = {
    //     algorithmName: algorithm!.name,
    //     errorThreshold: algorithm!.properties.hasErrorThreshold
    //       ? +errorThreshold
    //       : 0,
    //     maxLHS: algorithm!.properties.hasArityConstraint
    //       ? +maxLHSAttributes
    //       : -1,
    //     threadsCount: algorithm!.properties.isMultiThreaded ? +threadsCount : 1,
    //   };
    //   const datasetProps: FileProps = {
    //     delimiter: separator!,
    //     hasHeader,
    //   };
    //   const context: DefaultContext = {
    //     fetchOptions: {
    //       useUpload: true,
    //       onProgress: (ev: ProgressEvent) => {
    //         setUploadProgress(ev.loaded / ev.total);
    //       },
    //     },
    //   };
    //   if (file) {
    //     createTask({
    //       variables: {
    //         props,
    //         datasetProps,
    //         table: file,
    //       },
    //       context,
    //     });
    //   } else {
    //     chooseTask({
    //       variables: { props, fileID: builtinDataset!.ID },
    //       context,
    //     });
    //   }
    // }
  };

  return (
    <>
      {isWindowShown && (
        <BuiltinDatasetSelector disable={() => setIsWindowShown(false)}>
          {allowedValues.allowedBuiltinDatasets &&
            allowedValues.allowedBuiltinDatasets.map((dataset) => (
              <Toggle
                toggleCondition={builtinDataset === dataset}
                onClick={() => {
                  setFile(undefined);
                  setBuiltinDataset(dataset);
                  setSeparator(dataset.delimiter);
                  setHasHeader(dataset.hasHeader);
                }}
                key={dataset.ID}
                className="mx-2"
              >
                {dataset.fileName}
              </Toggle>
            ))}
        </BuiltinDatasetSelector>
      )}
      <Row className="mx-2 mb-3">
        <FormItem>
          <h5 className="text-white mb-0 mx-2">File:</h5>
          <UploadFile
            file={file}
            setFile={setFile}
            builtinDataset={builtinDataset?.fileName}
            openBuiltinDatasetSelector={() => setIsWindowShown(true)}
            disableBuiltinDataset={() => setBuiltinDataset(undefined)}
          />
        </FormItem>
        <FormItem enabled={!builtinDataset}>
          <h5 className="text-white mb-0 mx-2">File properties:</h5>
          <Toggle
            onClick={() => setHasHeader(!hasHeader)}
            toggleCondition={hasHeader}
            className="mx-2"
          >
            Header
          </Toggle>
          <h5 className="text-white mb-0 mx-2">separator</h5>
          <Value
            value={separator || ""}
            onChange={setSeparator}
            size={2}
            inputValidator={validators.separatorValidator}
            className="mx-2"
          />
        </FormItem>
        <FormItem>
          <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
          <div className="d-flex flex-wrap align-items-center">
            {allowedValues.allowedAlgorithms &&
              allowedValues.allowedAlgorithms.allowedCFDAlgorithms.map(
                (algo) => (
                  <Toggle
                    onClick={() => setAlgorithm(algo)}
                    toggleCondition={algorithm === algo}
                    key={algo.name}
                    className="mx-2"
                  >
                    {algo.name}
                  </Toggle>
                )
              )}
          </div>
        </FormItem>
        <FormItem enabled={algorithm?.properties.hasConfidence}>
          <h5 className="text-white mb-0 mx-2">Minimum confidence:</h5>
          <Value
            value={minimumConfidence}
            onChange={setMinimumConfidence}
            size={8}
            inputValidator={validators.errorValidator}
            className="mx-2"
          />
          <Slider
            value={minimumConfidence}
            onChange={setMinimumConfidence}
            step={1e-6}
            className="mx-2"
          />
        </FormItem>
        <FormItem enabled={algorithm?.properties.hasArityConstraint}>
          <h5 className="text-white mb-0 mx-2">Max LHS attributes:</h5>
          <Value
            value={maxLHSAttributes}
            onChange={setMaxLHSAttributes}
            size={3}
            inputValidator={validators.maxLHSValidator}
            className="mx-2"
          />
          <Slider
            value={maxLHSAttributes === "inf" ? "10" : maxLHSAttributes}
            min={1}
            max={10}
            onChange={setMaxLHSAttributes}
            step={1}
            className="mx-2"
          />
        </FormItem>
        <FormItem enabled={algorithm?.properties.hasSupport}>
          <h5 className="text-white mb-0 mx-2">Minimum support:</h5>
          <Value
            value={minimumSupport}
            onChange={setMinimumSupport}
            size={2}
            inputValidator={validators.maxLHSValidator}
            className="mx-2"
          />
          <Slider
            value={minimumSupport}
            onChange={setMinimumSupport}
            min={1}
            max={16}
            step={1}
            className="mx-2"
          />
        </FormItem>
      </Row>
      <Button enabled={isValid()} onClick={submit} variant="primary">
        Analyze
      </Button>
    </>
  );
};

export default AssociationRules;
