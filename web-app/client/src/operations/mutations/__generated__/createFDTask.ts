/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FDTaskProps, FileProps } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: createFDTask
// ====================================================

export interface createFDTask_createFDTask_state {
  __typename: "TaskState";
  taskID: string;
}

export interface createFDTask_createFDTask {
  __typename: "TaskInfo";
  state: createFDTask_createFDTask_state;
}

export interface createFDTask {
  createFDTask: createFDTask_createFDTask;
}

export interface createFDTaskVariables {
  props: FDTaskProps;
  datasetProps: FileProps;
  table: any;
}
