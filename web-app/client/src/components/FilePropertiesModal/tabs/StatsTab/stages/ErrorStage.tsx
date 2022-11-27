import { FC } from 'react';
import { Alert } from '@components/FileStats/Alert';
import styles from '../StatsTab.module.scss';

type StartStageProps = {
  error: string | null;
};

export const ErrorStage: FC<StartStageProps> = ({ error }: StartStageProps) => (
  <Alert header="Error" variant="error" className={styles.error}>
    {error || 'An unknown error has occurred'}
  </Alert>
);
