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
export type tableInfo = {
  ID: string;
  fileName: string;
  hasHeader: boolean;
  delimiter: string;
};
export type error = {
  code: number;
  message: string;
  suggestion?: string;
};
