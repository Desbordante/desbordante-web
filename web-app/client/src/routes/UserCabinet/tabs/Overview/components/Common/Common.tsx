import prettyBytes from 'pretty-bytes';
import { FC } from 'react';
import Statistic from '../Statistic';
import styles from './Common.module.scss';

interface Props {
  files: number;
  tasks: number;
  freeSpace: number;
}

const Common: FC<Props> = ({ files, tasks, freeSpace }) => {
  return (
    <section className={styles.commonSection}>
      <h5 className={styles.title}>Overview</h5>
      <div className={styles.statistics}>
        <Statistic label="Files uploaded" value={files} />
        <Statistic label="Tasks" value={tasks} />
        <Statistic
          label="Free space"
          value={prettyBytes(freeSpace, { binary: true })}
        />
      </div>
    </section>
  );
};

export default Common;
