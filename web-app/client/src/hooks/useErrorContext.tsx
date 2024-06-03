import { useContext } from 'react';
import { ErrorContext } from '@components/meta/ErrorContext';

export const useErrorContext = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error('Cannot use error context');
  }
  return ctx;
};
