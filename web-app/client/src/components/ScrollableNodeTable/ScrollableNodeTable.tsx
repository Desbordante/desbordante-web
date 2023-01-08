import classNames from 'classnames';
import { FC, ReactNode, UIEventHandler, useMemo, useRef } from 'react';
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
  const positionRef = useRef(0);

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

  const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    // scrollTop - relative position of the rows list top to the table's top
    // scrollHeight - height of the rows list
    // clientHeight - height of the table

    if (scrollTop !== positionRef.current) {
      // handle scroll only if the vertical position has changed
      positionRef.current = scrollTop;
      if (Math.abs(scrollTop) < 100) {
        // console.log('scrolling up');
        onScroll?.('up');
      }

      if (Math.abs(scrollTop - (scrollHeight - clientHeight)) < 100) {
        // console.log('scrolling down');
        onScroll?.('down');
      }
    }
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
                key={row.globalIndex ? row.globalIndex : rowIndex} // TODO: check if this is will save position on adding new rows
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
