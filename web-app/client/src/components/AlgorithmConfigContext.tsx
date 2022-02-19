import React, { createContext, useState, useEffect, useContext } from "react";
import { useQuery } from "@apollo/client";

import { tableInfo, FDAlgorithm, allowedAlgorithms } from "../types";
import { GET_ALGORITHMS_CONFIG } from "../graphql/operations/queries/getAlgorithmsConfig";
import { algorithmsConfig } from "../graphql/operations/queries/__generated__/algorithmsConfig";
import { ErrorContext } from "./ErrorContext";

type AlgorithmConfigContextType = {
  allowedValues: {
    allowedSeparators?: string[];
    allowedAlgorithms?: allowedAlgorithms;
    allowedBuiltinDatasets?: tableInfo[];
  };
  validators: {
    fileExistenceValidator: (file?: File) => boolean;
    fileSizeValidator: (file?: File) => boolean;
    fileFormatValidator: (file?: File) => boolean;
    separatorValidator: (sep?: string) => boolean;
    errorValidator: (err?: string) => boolean;
    maxLHSValidator: (lhs?: string) => boolean;
  };
};

export const AlgorithmConfigContext =
  createContext<AlgorithmConfigContextType | null>(null);

export const AlgorithmConfigContextProvider: React.FC = ({ children }) => {
  const { showError } = useContext(ErrorContext)!;

  const [allowedBuiltinDatasets, setAllowedBuiltinDatasets] =
    useState<tableInfo[]>();
  const [allowedFileFormats, setAllowedFileFormats] = useState<string[]>();
  const [allowedSeparators, setAllowedSeparators] = useState<string[]>();
  const [allowedAlgorithms, setAllowedAlgorithms] =
    useState<allowedAlgorithms>();
  const [maxfilesize, setMaxFileSize] = useState<number>();

  const { loading, data, error } = useQuery<algorithmsConfig>(
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
      const { allowedFileFormats, allowedDelimiters, maxFileSize } = fileConfig;
      setAllowedFileFormats(allowedFileFormats);
      setAllowedSeparators(allowedDelimiters);
      setMaxFileSize(maxFileSize);

      setAllowedBuiltinDatasets(allowedDatasets.map((info) => info.tableInfo));
      setAllowedAlgorithms({ allowedFDAlgorithms, allowedCFDAlgorithms });
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

  const fileExistenceValidator = (file?: File) => Boolean(file);
  const fileSizeValidator = (file?: File) =>
    Boolean(maxfilesize && file && file.size <= maxfilesize);
  const fileFormatValidator = (file?: File) =>
    Boolean(
      allowedFileFormats && file && allowedFileFormats.indexOf(file.type) !== -1
    );

  const separatorValidator = (sep?: string) =>
    Boolean(allowedSeparators && sep && allowedSeparators.indexOf(sep) !== -1);
  const errorValidator = (err?: string) =>
    Boolean(err && !Number.isNaN(+err) && +err >= 0 && +err <= 1);
  const maxLHSValidator = (lhs?: string) =>
    Boolean(
      lhs === "inf" ||
        (lhs && !Number.isNaN(+lhs) && +lhs > 0 && +lhs % 1 === 0)
    );

  const outValue = {
    allowedValues: {
      allowedSeparators,
      allowedAlgorithms,
      allowedBuiltinDatasets,
    },
    validators: {
      fileExistenceValidator,
      fileSizeValidator,
      fileFormatValidator,
      separatorValidator,
      errorValidator,
      maxLHSValidator,
    },
  };

  return (
    <AlgorithmConfigContext.Provider value={outValue}>
      {children}
    </AlgorithmConfigContext.Provider>
  );
};
