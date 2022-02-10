/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: algorithmsConfig
// ====================================================

export interface algorithmsConfig_algorithmsConfig_allowedDatasets_tableInfo {
  __typename: "TableInfo";
  ID: string;
  fileName: string;
  hasHeader: boolean;
  delimiter: string;
}

export interface algorithmsConfig_algorithmsConfig_allowedDatasets {
  __typename: "DatasetInfo";
  tableInfo: algorithmsConfig_algorithmsConfig_allowedDatasets_tableInfo;
}

export interface algorithmsConfig_algorithmsConfig_allowedFDAlgorithms_properties {
  __typename: "FDAlgorithmProps";
  hasArityConstraint: boolean;
  hasErrorThreshold: boolean;
  isMultiThreaded: boolean;
}

export interface algorithmsConfig_algorithmsConfig_allowedFDAlgorithms {
  __typename: "FDAlgorithmConfig";
  name: string;
  properties: algorithmsConfig_algorithmsConfig_allowedFDAlgorithms_properties;
}

export interface algorithmsConfig_algorithmsConfig_allowedCFDAlgorithms_properties {
  __typename: "CFDAlgorithmProps";
  hasConfidence: boolean;
  hasSupport: boolean;
}

export interface algorithmsConfig_algorithmsConfig_allowedCFDAlgorithms {
  __typename: "CFDAlgorithmConfig";
  name: string;
  properties: algorithmsConfig_algorithmsConfig_allowedCFDAlgorithms_properties;
}

export interface algorithmsConfig_algorithmsConfig_fileConfig {
  __typename: "InputFileConfig";
  allowedFileFormats: string[];
  allowedDelimiters: string[];
  maxFileSize: number;
}

export interface algorithmsConfig_algorithmsConfig {
  __typename: "AlgorithmsConfig";
  allowedDatasets: algorithmsConfig_algorithmsConfig_allowedDatasets[];
  allowedFDAlgorithms: algorithmsConfig_algorithmsConfig_allowedFDAlgorithms[];
  allowedCFDAlgorithms: algorithmsConfig_algorithmsConfig_allowedCFDAlgorithms[];
  fileConfig: algorithmsConfig_algorithmsConfig_fileConfig;
}

export interface algorithmsConfig {
  algorithmsConfig: algorithmsConfig_algorithmsConfig;
}
