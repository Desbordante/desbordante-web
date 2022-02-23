import React, { createContext, useEffect, useState } from "react";
import { error } from "../types/types";

type ErrorContextType = {
  error: error | undefined;
  showError: (error: error) => void;
  hideError: () => void;
  isErrorShown: boolean;
};

export const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorContextProvider: React.FC = ({ children }) => {
  const [error, setError] = useState<error>();
  const [isErrorShown, setIsErrorShown] = useState(false);

  const showError = (error: error) => {
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
