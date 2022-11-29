import { FC, useId } from 'react';
import Button from '@components/Button';
import { Progress } from '@components/FileStats/Progress';
import { getFileStats_datasetInfo_statsInfo_state_TaskState as TaskState } from '@graphql/operations/queries/__generated__/getFileStats';
import styles from '../StatsTab.module.scss';
import { Stage } from './Stage';

type ProcessingStageProps = {
  taskState: TaskState;
};

export const ProcessingStage: FC<ProcessingStageProps> = ({
  taskState,
}: ProcessingStageProps) => {
  const progressId = useId();

  return (
    <Stage buttons={<Button disabled>Start Processing</Button>}>
      <div className={styles.processing}>
        <div className={styles.processingLabel}>
          <label htmlFor={progressId}>Discovering statistics</label>
          {`${taskState.progress}%`}
        </div>
        <Progress value={taskState.progress} id={progressId} />
      </div>
    </Stage>
  );
};
