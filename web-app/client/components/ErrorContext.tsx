import React, { createContext, PropsWithChildren, useCallback, useState } from "react";

import { Error } from "../types/algorithms";

type ErrorContextType = {
  error: Error | undefined;
  showError: (error: Error) => void;
  hideError: () => void;
  isErrorShown: boolean;
};

export const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [error, setError] = useState<Error>();
  const [isErrorShown, setIsErrorShown] = useState(false);

  const showError = useCallback((err: Error) => {
    setError(err);
    setIsErrorShown(true);
  }, []);

  const hideError = useCallback(() => {
    setIsErrorShown(false);
  }, []);

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
