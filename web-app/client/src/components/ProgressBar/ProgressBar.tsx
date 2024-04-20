import classNames from 'classnames';
import styles from './ProgressBar.module.scss';

type ProgressProcessState = {
  state: 'process';
  amount: number;
};

type ProgressFailState = {
  state: 'fail';
};

type ProgressCompleteState = {
  state: 'complete';
};

export type ProgressIdleState = {
  state: 'idle';
};

export type Progress =
  | ProgressProcessState
  | ProgressFailState
  | ProgressCompleteState
  | ProgressIdleState;

type Props = {
  progress: Progress;
};

const ProgressBar = ({ progress }: Props) => {
  const isComplete = progress.state === 'complete';
  const isError = progress.state === 'fail';
  const progressAmount = progress.state === 'process' ? progress.amount : 0;
  return (
    <div
      className={classNames(
        styles.progress,
        isComplete && styles.complete,
        isError && styles.fail,
      )}
    >
      <div style={{ width: `${progressAmount * 100}%` }}></div>
    </div>
  );
};

export default ProgressBar;
