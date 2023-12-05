import {
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_intervals,
  GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_outliers,
} from '@graphql/operations/queries/__generated__/GetMainTaskDeps';
import cn from 'classnames';
import { FC, useLayoutEffect, useRef, useState } from 'react';
import styles from './CollapsableView.module.scss';

const titles = ['Intervals', 'Outliers'] as const;
type Title = (typeof titles)[number];

type Props = {
  output:
    | GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_outliers
    | GetMainTaskDeps_taskInfo_TaskInfo_data_result_ACTaskResult_ACs_intervals;
  title: Title;
};

const states = ['not required', 'hidden', 'view'] as const;
type CollapseState = (typeof states)[number];

const CollapsableView: FC<Props> = ({ output, title }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const [collapseState, setCollapseState] =
    useState<CollapseState>('not required');
  useLayoutEffect(() => {
    const parentOffset = parentRef.current?.offsetWidth;
    const childScroll = childRef.current?.scrollWidth;

    if (parentOffset && childScroll) {
      if (parentOffset < childScroll && collapseState == 'not required') {
        setCollapseState('hidden');
      } else {
        setCollapseState('not required');
      }
    }
  }, []);
  const shownData =
    output &&
    ('outliers' in output
      ? output.outliers
      : output.intervals.map((intr) => `[${intr[0]}, ${intr[1]}]`));

  return (
    <div className={styles.container} ref={parentRef}>
      {`${title} (${output.amount})`}
      <div className={styles.withShowAll}>
        <div
          className={cn(
            styles.collabsableOutput,
            collapseState === 'view' && styles.whenShowAll,
          )}
          ref={childRef}
        >
          {shownData &&
            shownData.map((elem, index) => (
              <>
                <span key={index}>{elem}</span>{' '}
              </>
            ))}
          {collapseState === 'view' && (
            <span
              className={cn(styles.buttonShow, styles.withoutMargin)}
              onClick={() => setCollapseState('hidden')}
            >
              Show&nbsp;less
            </span>
          )}
        </div>
        {collapseState === 'hidden' && (
          <div
            className={styles.buttonShow}
            onClick={() => setCollapseState('view')}
          >
            Show&nbsp;all
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsableView;
