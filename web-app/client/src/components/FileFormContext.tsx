import React, { createContext, useContext, useEffect, useState } from "react";
import { AlgorithmProps } from "../types/algorithmProps";
import { Dataset, isBuiltinDataset } from "../types/dataset";
import { FileProps } from "../types/fileProps";
import { AlgorithmConfigContext } from "./AlgorithmConfigContext";
import { MetricType, PrimitiveType } from "../types/globalTypes";
import { AllowedDataset } from "../types/types";

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
  minSupportCFD: "1",
  minSupportAR: "0.5",
  threadsCount: "2",
  metric: MetricType.MODULUS_OF_DIFFERENCE,
  radius: "2",
  ratio: "0.3",
};

export const FileFormContextProvider: React.FC = ({ children }) => {
  const { validators } = useContext(AlgorithmConfigContext)!;

  const [primitiveType, setPrimitiveType] = useState<PrimitiveType>(
    PrimitiveType.FD
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
      const file = dataset as AllowedDataset;
      setError((prevError) => ({
        ...prevError,
        dataset: !validators.isBuiltinDatasetValid(primitiveType, file),
      }));
    }
  }, [dataset, validators]);

  useEffect(() => {
    setError((prevError) => ({
      ...prevError,
      fileProps:
        !validators.isValidSeparator(fileProps.delimiter) ||
        (primitiveType === PrimitiveType.AR &&
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
        hasRadius,
        hasRatio,
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
              !validators.isBetweenZeroAndOne(algorithmProps.minSupportAR)) ||
            (hasSupport &&
              !validators.isInteger(algorithmProps.minSupportCFD)) ||
            (hasRadius && !validators.isPositive(algorithmProps.radius)) ||
            (hasRatio && !validators.isBetweenZeroAndOne(algorithmProps.ratio))
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
