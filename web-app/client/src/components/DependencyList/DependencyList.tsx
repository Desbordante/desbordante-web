import classNames from 'classnames';
import _ from 'lodash';
import { FC, ReactElement, useState } from 'react';
import LongArrowIcon from '@assets/icons/long-arrow.svg?component';
import { GeneralColumn } from '@utils/convertDependencies';
import styles from './DependencyList.module.scss';
import { useTaskContext } from '@components/TaskContext';

type Props = {
  deps: {
    confidence?: any;
    rhs: GeneralColumn[];
    lhs: GeneralColumn[];
  }[];
  infoVisible: boolean;
};

const makeSide: (
  data: GeneralColumn | GeneralColumn[],
  infoVisible: boolean
) => ReactElement = (data, infoVisible) => {
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((e) => (
          <span className={styles.attr}>
            {e.column.name}
            {infoVisible && e.pattern ? ' | ' + e.pattern : ''}
          </span>
        ))}
      </>
    );
  } else {
    return makeSide([data], infoVisible);
  }
};

const DependencyList: FC<Props> = ({ deps, infoVisible }) => {
  const { selectedDependency, selectDependency, clusterIsBeingProcessed } =
    useTaskContext();

  return (
    <div>
      {_.map(deps, (row, i) => {
        const fullDependency = row.lhs.concat(row.rhs);
        return (
          <div
            key={i}
            className={classNames(
              styles.row,
              JSON.stringify(selectedDependency) ===
                JSON.stringify(fullDependency) && styles.selectedRow
            )}
            onClick={() => selectDependency(fullDependency)}
          >
            {makeSide(row.lhs, infoVisible)}
            <LongArrowIcon />
            {typeof row.confidence !== 'undefined' && <p>{row.confidence}</p>}
            {makeSide(row.rhs, infoVisible)}
          </div>
        );
      })}
    </div>
  );
};

export default DependencyList;
