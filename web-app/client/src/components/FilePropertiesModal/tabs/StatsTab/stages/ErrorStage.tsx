import { FC } from 'react';
import { Alert } from '@components/FileStats/Alert';
import styles from '../StatsTab.module.scss';

type ErrorStageProps = {
  error: string | null;
};

export const ErrorStage: FC<ErrorStageProps> = ({ error }: ErrorStageProps) => (
  <Alert header="Error" variant="error" className={styles.error}>
    {error || 'An unknown error has occurred'}
  </Alert>
);
