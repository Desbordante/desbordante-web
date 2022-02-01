import React, { useState, useEffect, useContext } from "react";
import axios, { AxiosResponse } from "axios";
import { useHistory } from "react-router-dom";
import { Container, Row } from "react-bootstrap";

import "./FileForm.scss";
import Value from "../Value/Value";
import Toggle from "../Toggle/Toggle";
import Button from "../Button/Button";
import Slider from "../Slider/Slider";
import UploadFile from "../UploadFile/UploadFile";
import PopupWindow from "../PopupWindow/PopupWindow";
import FormItem from "../FormItem/FormItem";
import {
  serverURL,
  submitCustomDataset,
  submitBuiltinDataset,
} from "../../APIFunctions";
import { algorithm } from "../../types";
import { TaskContext } from "../TaskContext/TaskContext";
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
interface Props {
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  setUploadProgress: (n: number) => void;
  handleResponse: (res: AxiosResponse) => void;
}

const FileForm: React.FC<Props> = ({ setUploadProgress, handleResponse }) => {
  // Allowed field values
  const [allowedBuiltinDatasets, setAllowedBuiltinDatasets] = useState<
    { datasetName: string; datasetSeparator: string }[]
  >([]);
  const [allowedFileFormats, setAllowedFileFormats] = useState<string[]>([
    "text/csv",
    "application/vnd.ms-excel",
  ]);
  const [allowedSeparators, setAllowedSeparators] = useState<string[]>([","]);
  const [allowedAlgorithms, setAllowedAlgorithms] = useState<algorithm[]>([]);
  const [maxfilesize, setMaxFileSize] = useState(1e9);

  const { file, setFile } = useContext(TaskContext)!;

  // Parameters, later sent to the server on execution as JSON
  const [hasHeader, setHasHeader] = useState(true);
  const [separator, setSeparator] = useState(",");
  const [algorithm, setAlgorithm] = useState<algorithm | null>(null);
  const [errorThreshold, setErrorThreshold] = useState<string>("0.05");
  const [maxLHSAttributes, setMaxLHSAttributes] = useState<string>("5");
  const [threadsCount, setThreadsCount] = useState<string>("1");

  // Builtin datasets
  const [isWindowShown, setIsWindowShown] = useState(false);
  const [builtinDataset, setBuiltinDataset] = useState<string | null>(null);

  const history = useHistory();

  // Getting allowed field values from server
  useEffect(() => {
    axios
      .get(`${serverURL}/algsInfo`, { timeout: 2000 })
      .then((res) => res.data)
      .then((data) => {
        setAllowedFileFormats(data.allowedFileFormats);

        setAllowedBuiltinDatasets(data.allowedBuiltinDatasets);

        setAllowedAlgorithms(data.algorithmsInfo);
        setAlgorithm(data.algorithmsInfo[0]);

        setAllowedSeparators(data.allowedSeparators);
        setSeparator(data.allowedSeparators[0]);

        setMaxFileSize(data.maxFileSize);
      })
      .catch(() => history.push("/error"));
  }, [history]);

  useEffect(() => {
    if (!algorithm?.props.errorThreshold) {
      setErrorThreshold("0");
    }
    if (!algorithm?.props.maxLHS) {
      setMaxLHSAttributes("inf");
    }
    if (!algorithm?.props.threads) {
      setThreadsCount("1");
    }
  }, [algorithm]);

  // Validator functions for fields
  const fileExistenceValidator = (file: File | null) => !!file;
  const fileSizeValidator = (file: File | null) =>
    !!file && file.size <= maxfilesize;
  const fileFormatValidator = (file: File | null) =>
    !!file && allowedFileFormats.indexOf(file.type) !== -1;

  const separatorValidator = (sep: string) =>
    allowedSeparators.indexOf(sep) !== -1;
  const errorValidator = (err: string) =>
    !Number.isNaN(+err) && +err >= 0 && +err <= 1;
  const maxLHSValidator = (lhs: string) =>
    lhs === "inf" || (!Number.isNaN(+lhs) && +lhs > 0 && +lhs % 1 === 0);

  // Validator function that ensures every field is correct
  function isValid() {
    return (
      (!!builtinDataset ||
        (fileExistenceValidator(file) &&
          fileSizeValidator(file) &&
          fileFormatValidator(file))) &&
      separatorValidator(separator) &&
      errorValidator(errorThreshold) &&
      maxLHSValidator(maxLHSAttributes)
    );
  }

  const submit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const sendAlgName = algorithm ? algorithm.name : allowedAlgorithms[0].name;
    const sendErrorThreshold = +errorThreshold;
    const sendMaxLHS = maxLHSAttributes === "inf" ? -1 : +maxLHSAttributes;
    if (builtinDataset) {
      submitBuiltinDataset(
        builtinDataset!,
        {
          algName: sendAlgName,
          separator,
          errorPercent: sendErrorThreshold,
          maxLHS: sendMaxLHS,
          parallelism: threadsCount,
        },
        handleResponse
      );
    } else {
      history.push("/loading");
      submitCustomDataset(
        file as File,
        {
          algName: sendAlgName,
          separator,
          errorPercent: sendErrorThreshold,
          hasHeader,
          maxLHS: sendMaxLHS,
          parallelism: threadsCount,
        },
        setUploadProgress,
        handleResponse
      );
    }
  };

  return (
    <Container
      fluid="md"
      className="file-form h-100 py-4 flex-shrink-0 d-flex flex-column justify-content-start align-items-center"
    >
      {isWindowShown && (
        <PopupWindow disable={() => setIsWindowShown(false)}>
          {allowedBuiltinDatasets.map(({ datasetName, datasetSeparator }) => (
            <Toggle
              toggleCondition={builtinDataset === datasetName}
              onClick={() => {
                setFile(null);
                setBuiltinDataset(datasetName);
                setIsWindowShown(false);
                setSeparator(datasetSeparator);
              }}
              key={datasetName}
              className="mx-2"
            >
              {datasetName}
            </Toggle>
          ))}
        </PopupWindow>
      )}
      <Row className="mx-2 mb-3">
        <FormItem>
          <h5 className="text-white mb-0 mx-2">File:</h5>
          <UploadFile
            onClick={setFile}
            file={file}
            builtinDataset={builtinDataset}
            fileExistenceValidator={() => fileExistenceValidator(file)}
            fileSizeValidator={() => fileSizeValidator(file)}
            fileFormatValidator={() => fileFormatValidator(file)}
            openPopupWindow={() => setIsWindowShown(true)}
            disableBuiltinDataset={() => setBuiltinDataset(null)}
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
            value={separator}
            onChange={setSeparator}
            size={2}
            inputValidator={separatorValidator}
            className="mx-2"
          />
        </FormItem>
        <FormItem>
          <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
          <div className="d-flex flex-wrap align-items-center">
            {allowedAlgorithms.map((algo) => (
              <Toggle
                onClick={() => setAlgorithm(algo)}
                toggleCondition={algorithm === algo}
                key={algo.name}
                className="mx-2"
              >
                {algo.name}
              </Toggle>
            ))}
          </div>
        </FormItem>
        <FormItem enabled={algorithm?.props.errorThreshold}>
          <h5 className="text-white mb-0 mx-2">Error threshold:</h5>
          <Value
            value={errorThreshold}
            onChange={setErrorThreshold}
            size={8}
            inputValidator={errorValidator}
            className="mx-2"
          />
          <Slider
            value={errorThreshold}
            onChange={setErrorThreshold}
            step={1e-6}
            className="mx-2"
          />
        </FormItem>
        <FormItem enabled={algorithm?.props.maxLHS}>
          <h5 className="text-white mb-0 mx-2">Max LHS attributes:</h5>
          <Value
            value={maxLHSAttributes}
            onChange={setMaxLHSAttributes}
            size={3}
            inputValidator={maxLHSValidator}
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
        <FormItem enabled={algorithm?.props.threads}>
          <h5 className="text-white mb-0 mx-2">Threads:</h5>
          <Value
            value={threadsCount}
            onChange={setThreadsCount}
            size={2}
            inputValidator={maxLHSValidator}
            className="mx-2"
          />
          <Slider
            value={threadsCount}
            min={1}
            max={16}
            onChange={setThreadsCount}
            step={1}
            className="mx-2"
          />
        </FormItem>
      </Row>

      <Button enabled={isValid()} onClick={submit}>
        Analyze
      </Button>
    </Container>
  );
};

export default FileForm;
