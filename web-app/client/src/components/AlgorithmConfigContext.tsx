import React, { createContext, useState, useEffect, useContext } from "react";
import { useQuery } from "@apollo/client";

import { TableInfo, AllowedAlgorithms, ARAlgorithm } from "../types/types";
import { GET_ALGORITHMS_CONFIG } from "../graphql/operations/queries/getAlgorithmsConfig";
import { getAlgorithmsConfig } from "../graphql/operations/queries/__generated__/getAlgorithmsConfig";
import { ErrorContext } from "./ErrorContext";
import { BuiltinDataset } from "../types/dataset";

type AlgorithmConfigContextType = {
  allowedValues: {
    allowedSeparators?: string[];
    allowedAlgorithms?: AllowedAlgorithms;
    allowedBuiltinDatasets?: BuiltinDataset[];
  };
  validators: {
    isFile: (file?: File) => boolean;
    isOfValidSize: (file?: File) => boolean;
    isOfValidFormat: (file?: File) => boolean;
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
    useState<TableInfo[]>();
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
        allowedDatasets,
      } = data.algorithmsConfig;
      const allowedARAlgorithms: ARAlgorithm[] = [
        {
          name: "Apriori",
          properties: {
            hasSupport: true,
            hasConfidence: true,
          },
        },
      ];
      const { allowedFileFormats, allowedDelimiters, maxFileSize } = fileConfig;
      setAllowedFileFormats(allowedFileFormats);
      setAllowedSeparators(allowedDelimiters);
      setMaxFileSize(maxFileSize);

      setAllowedBuiltinDatasets(allowedDatasets.map((info) => info.tableInfo));
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
