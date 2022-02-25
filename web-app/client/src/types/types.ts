import {
  taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_rhs,
  taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs,
} from "../graphql/operations/queries/__generated__/taskInfo";

export type attribute = {
  column: { name: string; index?: number };
  value: number;
};
export type pieChartData = {
  lhs:
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs[];
  rhs:
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_rhs[]
    | taskInfo_taskInfo_data_FDTask_FDResult_pieChartData_lhs[];
};
export type dependencyEncoded = { lhs: number[]; rhs: number };
export type dependency = { lhs: string[]; rhs: string };
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
  name: string;
  properties: {};
};
export type allowedAlgorithms = {
  allowedFDAlgorithms: FDAlgorithm[];
  allowedCFDAlgorithms: CFDAlgorithm[];
  allowedARAlgorithms: ARAlgorithm[];
};

export type userPermissions = {
  canUseBuiltinDatasets: boolean;
  canChooseTask: boolean;
  canUploadFiles: boolean;
  canViewAdminInfo: boolean;
  canManageUserSessions: boolean;
};
export type user = {
  id?: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  permissions: userPermissions;
};
export type tableInfo = {
  ID: string;
  fileName: string;
  hasHeader: boolean;
  delimiter: string;
};
export type error = {
  code?: number;
  message: string;
  suggestion?: string;
};
export type builtinDataset = {
  fileName: string;
  ID: string;
};
export type associationRule = {
  lhs: string[];
  rhs: string[];
  confidence: number;
};

export const primitiveTypeList = [
  "Functional Dependencies",
  "Conditional Functional Dependencies",
  "Association Rules",
  "Error Detection Pipeline",
] as const;
export type PrimitiveType = typeof primitiveTypeList[number];

export type SignUpFormProps = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  company: string;
  occupation: string;
};
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};
export type DecodedToken = {
  deviceID: string;
  exp: number;
  iat: number;
  sessionID: string;
  userID: string;
  email: string;
  fullName: string;
  permissions: string[];
  accountStatus: string;
};
