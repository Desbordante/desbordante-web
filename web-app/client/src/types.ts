import {
  algorithmsConfig_algorithmsConfig_allowedFDAlgorithms_properties
} from "./operations/queries/__generated__/algorithmsConfig";

export type attribute = { name: string; value: number };
export type dependencyEncoded = { lhs: number[]; rhs: number };
export type dependency = { lhs: attribute[]; rhs: attribute };
export type taskStatus =
  | "UNSCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "SERVER ERROR"
  | "INCORRECT INPUT DATA";
export type parameters = {
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
export type user = {
  name: string;
  email: string;
  isAdmin: boolean;
};
