import { FC } from 'react';
import { Alert } from '@components/common/uikit/FileStats/Alert';
import styles from '../StatsTab.module.scss';

export const NotSupportedStage: FC = () => (
  <Alert header="Not supported" variant="warning" className={styles.warning}>
    Statistics are not supported for transactional datasets
  </Alert>
);
