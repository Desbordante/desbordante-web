/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteTask
// ====================================================

export interface deleteTask_deleteTask {
  __typename: "DeleteTaskAnswer";
  message: string;
}

export interface deleteTask {
  deleteTask: deleteTask_deleteTask;
}

export interface deleteTaskVariables {
  taskID: string;
}
