/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FDTaskProps } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: chooseFDTask
// ====================================================

export interface chooseFDTask_chooseFDTask_state {
  __typename: "TaskState";
  taskID: string;
}

export interface chooseFDTask_chooseFDTask {
  __typename: "TaskInfo";
  state: chooseFDTask_chooseFDTask_state;
}

export interface chooseFDTask {
  chooseFDTask: chooseFDTask_chooseFDTask;
}

export interface chooseFDTaskVariables {
  props: FDTaskProps;
  fileID: string;
}
