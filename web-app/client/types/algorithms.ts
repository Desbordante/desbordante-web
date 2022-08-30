
import { getAlgorithmsConfig_algorithmsConfig_allowedDatasets } from "../graphql/operations/queries/__generated__/getAlgorithmsConfig";

export type Attribute = {
  column: { name: string; index?: number };
  value: number;
};

export type TaskStatus =
  | "UNSCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "SERVER ERROR"
  | "INCORRECT INPUT DATA";
export type Parameters = {
  algName: string;
  separator: string;
  errorPercent: number;
  hasHeader: boolean;
  maxLHS: number;
};
export type FDAlgorithm = {
  name: string;
  properties: {
    hasArityConstraint: boolean;
    hasErrorThreshold: boolean;
    isMultiThreaded: boolean;
  };
};
export type CFDAlgorithm = {
  name: string;
  properties: {
    hasArityConstraint: boolean;
    hasSupport: boolean;
    hasConfidence: boolean;
  };
};
export type ARAlgorithm = {
  name: string;
  properties: {
    hasSupport: boolean;
    hasConfidence: boolean;
  };
};
export type EDPAlgorithm = {
  name: "Typo Miner";
  properties: {
    hasArityConstraint: boolean;
    hasErrorThreshold: boolean;
    isMultiThreaded: boolean;
    hasMetric: boolean;
    hasRadius: boolean;
    hasRatio: boolean;
  };
};
export type AllowedAlgorithms = {
  allowedFDAlgorithms: FDAlgorithm[];
  allowedCFDAlgorithms: CFDAlgorithm[];
  allowedARAlgorithms: ARAlgorithm[];
};


export type AllowedDataset =
  getAlgorithmsConfig_algorithmsConfig_allowedDatasets;
export type Error = {
  code?: number;
  message: string;
  suggestion?: string;
};
export type BuiltinDataset = {
  fileName: string;
  ID: string;
};

// export type AssociationRule = getARs_taskInfo_data_result_ARTaskResult_ARs;
