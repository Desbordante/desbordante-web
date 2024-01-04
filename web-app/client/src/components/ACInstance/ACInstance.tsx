import DivisionIcon from '@assets/icons/division.svg?component';
import MinusIcon from '@assets/icons/minus.svg?component';
import MultiplicationIcon from '@assets/icons/multiplication.svg?component';
import PlusIcon from '@assets/icons/plus.svg?component';
import ACAtom, {
  ACAtomDefaultValuesWithParams,
  ACInstance,
} from '@atoms/ACTaskAtom';
import {
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_attributes,
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_intervals,
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_outliers,
  Operation,
} from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import cn from 'classnames';
import { useAtom } from 'jotai';
import { FC } from 'react';
import CollapsableView from '../CollapsableView';
import styles from './ACInstance.module.scss';

type Props = {
  id: string;
  attributes: GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_attributes;
  operation: Operation;
  outliers: GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_outliers;
  intervals: GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_intervals;
};

export const operationIcons = {
  [Operation.ADDITION]: PlusIcon,
  [Operation.MULTIPLICATION]: MultiplicationIcon,
  [Operation.DIVISION]: DivisionIcon,
  [Operation.SUBTRACTION]: MinusIcon,
};

const ACInstance: FC<Props> = ({
  id,
  attributes,
  operation,
  outliers,
  intervals,
}) => {
  const [atom, setAtom] = useAtom(ACAtom);
  const handleSelect = () => {
    const instance: ACInstance = {
      id,
      attribute1: attributes.attribute1,
      attribute2: attributes.attribute2,
      intervals: intervals.intervals,
      outliers: outliers.outliers,
    };
    setAtom({ ...ACAtomDefaultValuesWithParams(atom.taskID, instance) });
  };

  const OperationIcon = operationIcons[operation as Operation];

  const isSelected = atom.instanceSelected?.id === id;

  return (
    <div
      className={cn(styles.containerOuter, isSelected && styles.selected)}
      onClick={handleSelect}
    >
      <div className={styles.containerInner}>
        Operation
        <div className={styles.attributes}>
          <div className={styles.attribute}>{attributes.attribute1}</div>
          <OperationIcon className={styles.icons} />

          <div className={styles.attribute}>{attributes.attribute2}</div>
        </div>
      </div>
      <CollapsableView title={`Intervals (${intervals.amount})`}>
        {intervals.intervals.map((elem) => (
          <>
            <span
              key={`intervals ${elem[0]} ${elem[1]}`}
            >{`[${elem[0]}, ${elem[1]}]`}</span>{' '}
          </>
        ))}
      </CollapsableView>
      <CollapsableView title={`Outliers (${outliers.amount})`}>
        {outliers.outliers.map((elem) => (
          <>
            <span key={`Outliers ${elem}`}>{elem}</span>{' '}
          </>
        ))}
      </CollapsableView>
    </div>
  );
};

export default ACInstance;
