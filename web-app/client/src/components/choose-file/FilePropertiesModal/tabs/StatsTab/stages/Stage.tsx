import { FC, ReactNode } from 'react';
import styles from '../StatsTab.module.scss';

type StageProps = {
  children: ReactNode;
  buttons: ReactNode;
};

export const Stage: FC<StageProps> = ({ children, buttons }: StageProps) => (
  <>
    <div className={styles.stats}>{children}</div>
    <div className={styles.buttonsRow}>{buttons}</div>
  </>
);
