import cn from 'classnames';
import { FC, useLayoutEffect, useRef, useState } from 'react';
import styles from './CollapsableView.module.scss';

type Props = {
  output: string[];
  title: string;
  amount?: number;
};

const states = ['not required', 'hidden', 'view'] as const;
type CollapseState = (typeof states)[number];

const CollapsableView: FC<Props> = ({ output, title, amount }) => {
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
      {amount && ` (${amount})`}
      <div className={styles.withShowAll}>
        <div
          className={cn(
            styles.collabsableOutput,
            collapseState === 'view' && styles.whenShowAll,
          )}
          ref={childRef}
        >
          {output.map((elem) => (
            <>
              <span key={elem.toString()}>{elem}</span>{' '}
            </>
          ))}
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
