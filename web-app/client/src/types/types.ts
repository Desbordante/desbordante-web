import { getAlgorithmsConfig_algorithmsConfig_allowedDatasets } from "../graphql/operations/queries/__generated__/getAlgorithmsConfig";
import { getARs_taskInfo_data_result_ARTaskResult_ARs } from "../graphql/operations/queries/AR/__generated__/getARs";

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
  name: string;
  properties: {};
};
export type AllowedAlgorithms = {
  allowedFDAlgorithms: FDAlgorithm[];
  allowedCFDAlgorithms: CFDAlgorithm[];
  allowedARAlgorithms: ARAlgorithm[];
};

export type UserPermissions = {
  canUseBuiltinDatasets: boolean;
  canChooseTask: boolean;
  canUploadFiles: boolean;
  canViewAdminInfo: boolean;
  canManageUserSessions: boolean;
};
export type User = {
  id?: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  permissions: UserPermissions;
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

export type AssociationRule = getARs_taskInfo_data_result_ARTaskResult_ARs;

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
