import classNames from 'classnames';
import _ from 'lodash';
import { FC, UIEventHandler, useCallback, useMemo, useRef } from 'react';
import styles from './Table.module.scss';

const mapFromArray = <T,>(array?: T[]) =>
  Object.fromEntries(array?.map((item) => [item, true]) || []);

type Props = {
  data: string[][];
  header?: string[] | null;
  highlightRowIndices?: number[];
  highlightColumnIndices?: number[];
  shownColumnIndices?: number[];
  onScroll?: () => Promise<void>;
  className?: string;
};

const Table: FC<Props> = ({
  data,
  header,
  highlightRowIndices,
  highlightColumnIndices,
  shownColumnIndices,
  onScroll,
  className,
}) => {
  const shouldIgnoreScroll = useRef(false);

  const displayHeader = useMemo(
    () => header || data[0].map((_, index) => `Column ${index}`),
    [header, data],
  );

  const highlightedRowsMap = useMemo(
    () => mapFromArray(highlightRowIndices),
    [highlightRowIndices],
  );

  const highlightedColumnsMap = useMemo(
    () => mapFromArray(highlightColumnIndices),
    [highlightColumnIndices],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnScroll = useCallback(
    _.debounce(onScroll || (async () => undefined), 500),
    [onScroll],
  );

  const handleScroll: UIEventHandler<HTMLDivElement> = async (event) => {
    if (shouldIgnoreScroll.current || !debouncedOnScroll) {
      return;
    }

    shouldIgnoreScroll.current = true;

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    if (scrollHeight - clientHeight - scrollTop < 100) {
      await debouncedOnScroll();
    }

    shouldIgnoreScroll.current = false;
  };

  return (
    <div
      className={classNames(styles.container, className)}
      onScroll={handleScroll}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {displayHeader.map((item, columnIndex) => (
              <td
                key={item}
                className={classNames(
                  columnIndex in highlightedColumnsMap && styles.highlighted,
                  shownColumnIndices &&
                    !shownColumnIndices.includes(columnIndex) &&
                    styles.hidden,
                )}
              >
                {item}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((item, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={classNames(
                      (rowIndex in highlightedRowsMap ||
                        columnIndex in highlightedColumnsMap) &&
                        styles.highlighted,
                      shownColumnIndices &&
                        !shownColumnIndices.includes(columnIndex) &&
                        styles.hidden,
                    )}
                  >
                    {item}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
