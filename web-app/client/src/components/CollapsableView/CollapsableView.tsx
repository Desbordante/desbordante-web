import cn from 'classnames';
import { useLayoutEffect, useRef, useState } from 'react';
import { FCWithChildren } from 'types/react';
import styles from './CollapsableView.module.scss';

type Props = {
  title: string;
};

const states = ['not required', 'hidden', 'view'] as const;
type CollapseState = (typeof states)[number];

const CollapsableView: FCWithChildren<Props> = ({ children, title }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const [collapseState, setCollapseState] =
    useState<CollapseState>('not required');

  useLayoutEffect(() => {
    const parentOffset = parentRef.current?.offsetWidth;
    const childScroll = childRef.current?.scrollWidth;

    if (parentOffset && childScroll) {
      if (parentOffset < childScroll) {
        setCollapseState('hidden');
      } else {
        setCollapseState('not required');
      }
    }
  }, []);
  return (
    <div className={styles.container} ref={parentRef}>
      {title}
      <div className={styles.withShowAll}>
        <div
          className={cn(
            styles.collabsableOutput,
            collapseState === 'view' && styles.whenShowAll,
          )}
          ref={childRef}
        >
          {children}
          {collapseState === 'view' && (
            <button
              className={cn(styles.buttonShow, styles.withoutMargin)}
              onClick={() => setCollapseState('hidden')}
            >
              Show&nbsp;less
            </button>
          )}
        </div>
        {collapseState === 'hidden' && (
          <button
            className={styles.buttonShow}
            onClick={() => setCollapseState('view')}
          >
            Show&nbsp;all
          </button>
        )}
      </div>
    </div>
  );
};

export default CollapsableView;
