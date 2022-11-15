import { useReducer } from "react";

export const useToggle = (initialValue: boolean) => {
  return useReducer((value) => !value, initialValue);
};
