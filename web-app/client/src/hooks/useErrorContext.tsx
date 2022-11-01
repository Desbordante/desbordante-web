import { ErrorContext } from "@components/ErrorContext";
import { useContext } from "react";

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error("Cannot use error context");
  }
  return ctx;
};
