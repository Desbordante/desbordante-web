import { FC, ReactNode } from 'react';
import styles from './Statistic.module.scss';

interface Props {
  label: string;
  value: ReactNode;
}

const Statistic: FC<Props> = ({ label, value }) => {
  return (
    <div className={styles.statistic}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
};

export default Statistic;
