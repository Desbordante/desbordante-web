import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { showError as showErrorToast } from '@utils/toasts';
import { Error } from 'types/algorithms';

type ErrorContextType = {
  error: Error | undefined;
  showError: (error: Error) => void;
};

export const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [error, setError] = useState<Error>();

  const showError = useCallback((err: Error) => {
    setError(err);
  }, []);

  useEffect(() => {
    if (error) {
      showErrorToast('Error', error?.message);
    }
  }, [error]);

  const outValue = {
    error,
    showError,
  };

  return (
    <ErrorContext.Provider value={outValue}>{children}</ErrorContext.Provider>
  );
};
