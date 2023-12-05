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
import { FC, useLayoutEffect, useRef, useState } from 'react';
import CollapsableView from '../CollapsableView/CollapsableView';
import styles from './Intervals.module.scss';

type Props = {
  attributes: GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_attributes;
  operation: Operation;
  outliers: GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_outliers;
  intervals: GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_intervals;
};

const states = ['not required', 'hidden', 'view'] as const;
type OutputState = (typeof states)[number];

const Intervals: FC<Props> = ({
  attributes,
  operation,
  outliers,
  intervals,
}) => {
  const intervalsRef = useRef<HTMLDivElement>(null);
  const intervalsOutputRef = useRef<HTMLDivElement>(null);
  const oultiersRef = useRef<HTMLDivElement>(null);
  const outliersOutputRef = useRef<HTMLDivElement>(null);

  const [intervalsState, setIntervalsState] =
    useState<OutputState>('not required');
  const [outliersState, setOutliersState] =
    useState<OutputState>('not required');

  useLayoutEffect(() => {
    const parentIntervalsOffset = intervalsRef.current?.offsetWidth;
    const childIntervalsScroll = intervalsOutputRef.current?.scrollWidth;

    const parentOutliersOffset = oultiersRef.current?.offsetWidth;
    const childOutliersScroll = outliersOutputRef.current?.scrollWidth;

    if (parentIntervalsOffset && childIntervalsScroll) {
      if (
        parentIntervalsOffset < childIntervalsScroll &&
        intervalsState == 'not required'
      ) {
        setIntervalsState('hidden');
      } else {
        setIntervalsState('not required');
      }
    }

    if (parentOutliersOffset && childOutliersScroll) {
      if (
        parentOutliersOffset < childOutliersScroll &&
        outliersState == 'not required'
      ) {
        setOutliersState('hidden');
      } else {
        setOutliersState('not required');
      }
    }
  }, [intervalsState, outliersState]);
  const operationIcon =
    (operation === 'ADDITION' && <PlusIcon className={styles.icons} />) ||
    (operation === 'MULTIPLICATION' && (
      <MultiplicationIcon className={styles.icons} />
    )) ||
    (operation === 'DIVISION' && <DivisionIcon className={styles.icons} />) ||
    (operation === 'SUBTRACTION' && <MinusIcon className={styles.icons} />);

  const [atom, setAtom] = useAtom(ACAtom);
  const handleSelect = () => {
    const instance: ACInstance = {
      attribute1: attributes.attr1,
      attribute2: attributes.attr2,
      intervals: intervals.intervals,
      outliers: outliers.outliers,
    };
    setAtom({ ...ACAtomDefaultValuesWithParams(atom.taskID, instance) });
  };

  const variant =
    atom.instanceSelected?.attribute1 === attributes.attr1 &&
    atom.instanceSelected?.attribute2 === attributes.attr2
      ? 'selected'
      : 'default';
  return (
    <div
      className={cn(styles.containerOuter, styles[`${variant}`])}
      onClick={handleSelect}
    >
      <div className={styles.containerInner}>
        Operation
        <div className={styles.attributes}>
          <div className={styles.attr}>{attributes.attr1}</div>
          {operationIcon}
          <div className={styles.attr}>{attributes.attr2}</div>
        </div>
      </div>
      <CollapsableView title="Intervals" output={intervals} />
      <CollapsableView title="Outliers" output={outliers} />
    </div>
  );
};

export default Intervals;
