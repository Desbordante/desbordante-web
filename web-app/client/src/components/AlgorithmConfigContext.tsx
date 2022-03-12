import React, { createContext, useState, useEffect, useContext } from "react";
import { useQuery } from "@apollo/client";

import { AllowedDataset, AllowedAlgorithms } from "../types/types";
import { GET_ALGORITHMS_CONFIG } from "../graphql/operations/queries/getAlgorithmsConfig";
import { getAlgorithmsConfig } from "../graphql/operations/queries/__generated__/getAlgorithmsConfig";
import { ErrorContext } from "./ErrorContext";
import { PrimitiveType } from "../types/globalTypes";

type AlgorithmConfigContextType = {
  allowedValues: {
    allowedSeparators?: string[];
    allowedAlgorithms?: AllowedAlgorithms;
    allowedBuiltinDatasets?: AllowedDataset[];
  };
  validators: {
    isFile: (file?: File) => boolean;
    isOfValidSize: (file?: File) => boolean;
    isOfValidFormat: (file?: File) => boolean;
    isBuiltinDatasetValid: (
      primitive: PrimitiveType,
      file?: AllowedDataset
    ) => boolean;
    isValidSeparator: (sep?: string) => boolean;
    isBetweenZeroAndOne: (err?: string) => boolean;
    isInteger: (lhs?: string) => boolean;
  };
};

export const AlgorithmConfigContext =
  createContext<AlgorithmConfigContextType | null>(null);

export const AlgorithmConfigContextProvider: React.FC = ({ children }) => {
  const { showError } = useContext(ErrorContext)!;

  const [allowedBuiltinDatasets, setAllowedBuiltinDatasets] =
    useState<AllowedDataset[]>();
  const [allowedFileFormats, setAllowedFileFormats] = useState<string[]>();
  const [allowedSeparators, setAllowedSeparators] = useState<string[]>();
  const [allowedAlgorithms, setAllowedAlgorithms] =
    useState<AllowedAlgorithms>();
  const [maxfilesize, setMaxFileSize] = useState<number>();

  const { loading, data, error } = useQuery<getAlgorithmsConfig>(
    GET_ALGORITHMS_CONFIG
  );

  useEffect(() => {
    if (data) {
      const {
        fileConfig,
        allowedFDAlgorithms,
        allowedCFDAlgorithms,
        allowedARAlgorithms,
        allowedDatasets,
      } = data.algorithmsConfig;

      const { allowedFileFormats, allowedDelimiters, maxFileSize } = fileConfig;
      setAllowedFileFormats(allowedFileFormats);
      setAllowedSeparators(allowedDelimiters);
      setMaxFileSize(maxFileSize);

      setAllowedBuiltinDatasets(allowedDatasets);
      setAllowedAlgorithms({
        allowedFDAlgorithms,
        allowedCFDAlgorithms,
        allowedARAlgorithms,
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      showError({
        code: 404,
        message: error.message,
        suggestion: "Please, try reloading the page.",
      });
    }
  }, [error]);

  const isFile = (file?: File) => Boolean(file);
  const isOfValidSize = (file?: File) =>
    Boolean(maxfilesize && file && file.size <= maxfilesize);
  const isOfValidFormat = (file?: File) =>
    Boolean(
      allowedFileFormats && file && allowedFileFormats.indexOf(file.type) !== -1
    );
  const isBuiltinDatasetValid = (
    primitive: PrimitiveType,
    file?: AllowedDataset
  ) => Boolean(file && file.supportedPrimitives.includes(primitive));

  const isValidSeparator = (sep?: string) =>
    Boolean(allowedSeparators && sep && allowedSeparators.indexOf(sep) !== -1);
  const isBetweenZeroAndOne = (n?: string) =>
    Boolean(n && !Number.isNaN(+n) && +n >= 0 && +n <= 1);
  const isInteger = (n?: string) =>
    Boolean(n && !Number.isNaN(+n) && +n > 0 && +n % 1 === 0);

  const outValue = {
    allowedValues: {
      allowedSeparators,
      allowedAlgorithms,
      allowedBuiltinDatasets,
    },
    validators: {
      isFile,
      isOfValidSize,
      isOfValidFormat,
      isValidSeparator,
      isBuiltinDatasetValid,
      isBetweenZeroAndOne,
      isInteger,
    },
  };

  return (
    <AlgorithmConfigContext.Provider value={outValue}>
      {children}
    </AlgorithmConfigContext.Provider>
  );
};
