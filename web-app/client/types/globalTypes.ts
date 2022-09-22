/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ARSortBy {
  CONF = "CONF",
  DEFAULT = "DEFAULT",
  LHS_NAME = "LHS_NAME",
  RHS_NAME = "RHS_NAME",
}

export enum CFDSortBy {
  CONF = "CONF",
  DEFAULT = "DEFAULT",
  LHS_COL_ID = "LHS_COL_ID",
  LHS_COL_NAME = "LHS_COL_NAME",
  LHS_PATTERN = "LHS_PATTERN",
  RHS_COL_ID = "RHS_COL_ID",
  RHS_COL_NAME = "RHS_COL_NAME",
  RHS_PATTERN = "RHS_PATTERN",
  SUP = "SUP",
}

export enum FDSortBy {
  LHS_COL_ID = "LHS_COL_ID",
  LHS_NAME = "LHS_NAME",
  RHS_COL_ID = "RHS_COL_ID",
  RHS_NAME = "RHS_NAME",
}

export enum InputFileFormat {
  SINGULAR = "SINGULAR",
  TABULAR = "TABULAR",
}

export enum MainPrimitiveType {
  AR = "AR",
  CFD = "CFD",
  FD = "FD",
  TypoFD = "TypoFD",
}

export enum MetricType {
  LEVENSHTEIN = "LEVENSHTEIN",
  MODULUS_OF_DIFFERENCE = "MODULUS_OF_DIFFERENCE",
}

export enum OrderBy {
  ASC = "ASC",
  DESC = "DESC",
}

export enum PermissionType {
  MANAGE_APP_CONFIG = "MANAGE_APP_CONFIG",
  MANAGE_USERS_SESSIONS = "MANAGE_USERS_SESSIONS",
  USE_BUILTIN_DATASETS = "USE_BUILTIN_DATASETS",
  USE_OWN_DATASETS = "USE_OWN_DATASETS",
  USE_USERS_DATASETS = "USE_USERS_DATASETS",
  VIEW_ADMIN_INFO = "VIEW_ADMIN_INFO",
}

export enum PrimitiveType {
  AR = "AR",
  CFD = "CFD",
  FD = "FD",
  TypoCluster = "TypoCluster",
  TypoFD = "TypoFD",
}

export enum ResourceLimitErrorType {
  MEMORY_LIMIT = "MEMORY_LIMIT",
  TIME_LIMIT = "TIME_LIMIT",
}

export enum SpecificTaskType {
  TypoCluster = "TypoCluster",
}

export enum TaskErrorStatusType {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RESOURCE_LIMIT_IS_REACHED = "RESOURCE_LIMIT_IS_REACHED",
}

export enum TaskProcessStatusType {
  ADDED_TO_THE_TASK_QUEUE = "ADDED_TO_THE_TASK_QUEUE",
  ADDING_TO_DB = "ADDING_TO_DB",
  COMPLETED = "COMPLETED",
  IN_PROCESS = "IN_PROCESS",
}

export interface CreatingUserProps {
  fullName: string;
  email: string;
  pwdHash: string;
  country: string;
  companyOrAffiliation: string;
  occupation: string;
}

export interface FileProps {
  delimiter: string;
  hasHeader: boolean;
  inputFormat?: InputFileFormat | null;
  tidColumnIndex?: number | null;
  itemColumnIndex?: number | null;
  hasTid?: boolean | null;
}

export interface IntersectionFilter {
  filterString: string;
  orderBy: OrderBy;
  pagination: Pagination;
  ARSortBy?: ARSortBy | null;
  CFDSortBy?: CFDSortBy | null;
  FDSortBy?: FDSortBy | null;
  mustContainRhsColIndices?: number[] | null;
  mustContainLhsColIndices?: number[] | null;
  withoutKeys?: boolean | null;
}

export interface IntersectionMainTaskProps {
  algorithmName: string;
  type: MainPrimitiveType;
  errorThreshold?: number | null;
  maxLHS?: number | null;
  threadsCount?: number | null;
  minSupportCFD?: number | null;
  minSupportAR?: number | null;
  minConfidence?: number | null;
  preciseAlgorithm?: string | null;
  approximateAlgorithm?: string | null;
  metric?: MetricType | null;
  defaultRadius?: number | null;
  defaultRatio?: number | null;
}

export interface IntersectionSpecificTaskProps {
  algorithmName: string;
  type: SpecificTaskType;
  parentTaskID?: string | null;
  typoFD?: number[] | null;
  radius?: number | null;
  ratio?: number | null;
}

export interface Pagination {
  offset: number;
  limit: number;
}

export interface SpecificClusterTaskProps {
  clusterID: number;
  sort: boolean;
  squash: boolean;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
