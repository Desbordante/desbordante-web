import React, { createContext, useEffect, useState } from "react";
import { Error } from "../types/types";

type ErrorContextType = {
  error: Error | undefined;
  showError: (error: Error) => void;
  hideError: () => void;
  isErrorShown: boolean;
};

export const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorContextProvider: React.FC = ({ children }) => {
  const [error, setError] = useState<Error>();
  const [isErrorShown, setIsErrorShown] = useState(false);

  const showError = (error: Error) => {
    setError(error);
    setIsErrorShown(true);
  };

  const hideError = () => {
    setIsErrorShown(false);
  };

  const outValue = {
    error,
    showError,
    hideError,
    isErrorShown,
  };

  return (
    <ErrorContext.Provider value={outValue}>{children}</ErrorContext.Provider>
  );
};
