import classNames from 'classnames';
import {
  FC,
  UIEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { TableProps } from './TableTypes';
import styles from './ScrollableNodeTable.module.scss';

const mapFromArray = <T,>(array?: T[]) =>
  Object.fromEntries(array?.map((item) => [item, true]) || []);

const Table: FC<TableProps> = ({
  data,
  header,
  highlightRowIndices,
  highlightColumnIndices,
  hiddenColumnIndices,
  onScroll,
  className,
}) => {
  const threshold = 200;

  const tableDivRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const isScrolledToTop = useRef(false);

  // move the table to the top on page load
  // TODO: figure out how to scroll to the top then cluster changes
  useEffect(() => {
    if (tableDivRef.current)
      tableDivRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });

    isScrolledToTop.current = true;
  }, []);

  const displayHeader = useMemo(
    () => header || data[0].items.map((_, index) => `Column ${index}`),
    [header, data]
  );

  const highlightedRowsMap = useMemo(
    () => mapFromArray(highlightRowIndices),
    [highlightRowIndices]
  );

  const highlightedColumnsMap = useMemo(
    () => mapFromArray(highlightColumnIndices),
    [highlightColumnIndices]
  );

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!isScrolledToTop.current) return;

      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

      if (scrollTop !== positionRef.current) {
        const scrollDifference = positionRef.current - scrollTop;

        positionRef.current = scrollTop;
        if (scrollTop < threshold && scrollDifference > 0) {
          onScroll?.('up');
        }

        if (
          scrollHeight - clientHeight - scrollTop < threshold &&
          scrollDifference < 0
        ) {
          onScroll?.('down');
        }
      }
    },
    [isScrolledToTop, onScroll]
  );

  return (
    <div
      className={classNames(styles.container, className)}
      onScroll={handleScroll}
      ref={tableDivRef}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {displayHeader.map((item, columnIndex) => (
              <td
                key={item}
                className={classNames(
                  columnIndex in highlightedColumnsMap && styles.highlighted,
                  hiddenColumnIndices &&
                    hiddenColumnIndices.includes(columnIndex) &&
                    styles.hidden
                )}
              >
                {item}
              </td>
            ))}
          </tr>
        </thead>

        <tbody>
          {data &&
            data.map((row) => (
              <tr
                key={row.globalIndex}
                className={classNames(styles.row, row.style)}
              >
                {row.items.map((item, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={classNames(
                      (row.globalIndex in highlightedRowsMap ||
                        columnIndex in highlightedColumnsMap) &&
                        styles.highlighted,
                      hiddenColumnIndices &&
                        hiddenColumnIndices.includes(columnIndex) &&
                        styles.hidden
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
