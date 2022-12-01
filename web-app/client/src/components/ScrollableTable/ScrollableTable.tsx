import classNames from 'classnames';
import { FC, UIEventHandler, useMemo } from 'react';
import styles from './Table.module.scss';

const mapFromArray = <T,>(array?: T[]) =>
  Object.fromEntries(array?.map((item) => [item, true]) || []);

type Props = {
  data: string[][];
  header: string[] | null;
  highlightRowIndices?: number[];
  highlightColumnIndices?: number[];
  shownColumnIndices?: number[];
  onScroll?: () => void;
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
  const displayHeader = useMemo(
    () => header || data[0].map((_, index) => `Column ${index}`),
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

    if (Math.abs(scrollTop - (scrollHeight - clientHeight)) < 100) {
      onScroll?.();
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
                  shownColumnIndices &&
                    !shownColumnIndices.includes(columnIndex) &&
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
