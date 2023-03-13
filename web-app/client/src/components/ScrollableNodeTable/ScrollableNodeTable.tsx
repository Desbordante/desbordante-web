import classNames from 'classnames';
import {
  FC,
  ReactNode,
  UIEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Row, ScrollDirection, TableProps } from './TableTypes';
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
  useEffect(() => {
    // console.info('scrolling to top');

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

  // TODO: handle scroll calls when position is low
  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      // not handling scroll if the table is not scrolled to the top
      if (!isScrolledToTop.current) return;

      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      // scrollTop - relative position of the rows list top to the table's top
      // scrollHeight - height of the rows list
      // clientHeight - height of the table

      // console.log(scrollTop, scrollHeight, clientHeight);

      if (scrollTop !== positionRef.current) {
        const scrollDifference = positionRef.current - scrollTop;

        // handle scroll only if the vertical position has changed and the table is scrolled up
        positionRef.current = scrollTop;
        if (Math.abs(scrollTop) < threshold && scrollDifference > 0) {
          onScroll?.('up');
          console.log('scrolling up');
        }

        // handle scroll only if the vertical position has changed and the table is scrolled down
        if (
          Math.abs(scrollTop - (scrollHeight - clientHeight)) < threshold &&
          scrollDifference < 0
        ) {
          onScroll?.('down');
          console.log('scrolling down');
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
            data.map((row, rowIndex) => (
              <tr
                key={
                  row.globalIndex
                    ? row.globalIndex.toString()
                    : rowIndex.toString()
                } // TODO: check if this is will save position on adding new rows
                className={classNames(styles.row, row.style)}
              >
                {row.items.map((item, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={classNames(
                      (rowIndex in highlightedRowsMap ||
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
