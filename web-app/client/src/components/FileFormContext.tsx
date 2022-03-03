import React, { createContext, useState, useEffect, useContext } from "react";
import { AlgorithmProps } from "../types/algorithmProps";
import { Dataset, isBuiltinDataset } from "../types/dataset";
import { FileProps } from "../types/fileProps";

import { PrimitiveType, primitiveTypeList } from "../types/types";
import { AlgorithmConfigContext } from "./AlgorithmConfigContext";

type FileFormContextType = {
  primitiveType: PrimitiveType;
  setPrimitiveType: React.Dispatch<React.SetStateAction<PrimitiveType>>;
  dataset: Dataset | undefined;
  setDataset: React.Dispatch<React.SetStateAction<Dataset | undefined>>;
  fileProps: FileProps;
  setFileProps: React.Dispatch<React.SetStateAction<FileProps>>;
  algorithmProps: AlgorithmProps;
  setAlgorithmProps: React.Dispatch<React.SetStateAction<AlgorithmProps>>;
  isValid: boolean;
  fileUploadProgress: number;
  setFileUploadProgress: React.Dispatch<React.SetStateAction<number>>;
};

export const FileFormContext = createContext<FileFormContextType | null>(null);

const defaultFileProps: FileProps = {
  delimiter: ",",
  hasHeader: true,
  hasTransactionId: true,
  fileFormat: "Singular",
  itemSetColumn: "2",
  transactionIdColumn: "1",
};

const defaultAlgorithmProps: AlgorithmProps = {
  arityConstraint: "5",
  errorThreshold: "0.005",
  minConfidence: "0.5",
  minSupport: "1",
  threadsCount: "2",
};

export const FileFormContextProvider: React.FC = ({ children }) => {
  const { validators } = useContext(AlgorithmConfigContext)!;

  const [primitiveType, setPrimitiveType] = useState<PrimitiveType>(
    primitiveTypeList[0]
  );

  const [dataset, setDataset] = useState<Dataset>();
  const [fileProps, setFileProps] = useState<FileProps>(defaultFileProps);
  const [algorithmProps, setAlgorithmProps] = useState<AlgorithmProps>(
    defaultAlgorithmProps
  );
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState({
    dataset: true,
    fileProps: true,
    algorithmProps: true,
  });
  const [fileUploadProgress, setFileUploadProgress] = useState(0);

  useEffect(() => {
    if (!isBuiltinDataset(dataset)) {
      const file = dataset as File;
      setError((prevError) => ({
        ...prevError,
        dataset:
          !validators.isFile(file) ||
          !validators.isOfValidFormat(file) ||
          !validators.isOfValidSize(file),
      }));
    } else {
      setError((prevError) => ({ ...prevError, dataset: false }));
    }
  }, [dataset, validators]);

  useEffect(() => {
    setError((prevError) => ({
      ...prevError,
      fileProps:
        !validators.isValidSeparator(fileProps.delimiter) ||
        (primitiveType === "Association Rules" &&
          !(
            validators.isInteger(fileProps.itemSetColumn) &&
            validators.isInteger(fileProps.transactionIdColumn)
          )),
    }));
  }, [fileProps, validators]);

  useEffect(() => {
    if (algorithmProps?.algorithm?.properties) {
      const {
        hasErrorThreshold,
        hasConfidence,
        hasArityConstraint,
        isMultiThreaded,
        hasSupport,
      } = algorithmProps.algorithm.properties;

      setError((prevError) => ({
        ...prevError,
        algorithmProps: Boolean(
          (hasErrorThreshold &&
            !validators.isBetweenZeroAndOne(algorithmProps.errorThreshold)) ||
            (hasConfidence &&
              !validators.isBetweenZeroAndOne(algorithmProps.minConfidence)) ||
            (hasArityConstraint &&
              !validators.isInteger(algorithmProps.arityConstraint)) ||
            (isMultiThreaded &&
              !validators.isInteger(algorithmProps.threadsCount)) ||
            (hasSupport &&
              !(primitiveType === "Association Rules"
                ? validators.isBetweenZeroAndOne(algorithmProps.minSupport)
                : validators.isInteger(algorithmProps.minSupport)))
        ),
      }));
    } else {
      setError((prevError) => ({ ...prevError, algorithmProps: true }));
    }
  }, [algorithmProps, validators]);

  useEffect(
    () =>
      setIsValid(!error.dataset && !error.fileProps && !error.algorithmProps),
    [error]
  );

  const outValue = {
    primitiveType,
    setPrimitiveType,
    dataset,
    setDataset,
    fileProps,
    setFileProps,
    algorithmProps,
    setAlgorithmProps,
    isValid,
    fileUploadProgress,
    setFileUploadProgress,
  };

  return (
    <FileFormContext.Provider value={outValue}>
      {children}
    </FileFormContext.Provider>
  );
};
