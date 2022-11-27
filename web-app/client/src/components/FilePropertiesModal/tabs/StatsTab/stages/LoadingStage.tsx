import { FC } from 'react';
import styles from '../StatsTab.module.scss';

export const LoadingStage: FC = () => (
  <div className={styles.loading}>
    <h5>Loading...</h5>
  </div>
);
