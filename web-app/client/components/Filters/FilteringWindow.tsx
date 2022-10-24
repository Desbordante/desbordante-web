import PopupWindowContainer from '@components/PopupWindowContainer';
import React, { FC } from 'react';
import _ from 'lodash';
import styles from './Filters.module.scss';

type FilteringProps = {
  setIsFilteringShown: (arg: boolean) => void;
};

export const FilteringWindow: FC<FilteringProps> = ({
  setIsFilteringShown,
}) => {
  return (
    <>
      <PopupWindowContainer onOutsideClick={() => setIsFilteringShown(false)}>
        <div className={styles.container}>
          <h5>Choose filters</h5>
        </div>
      </PopupWindowContainer>
    </>
  );
};

export default FilteringWindow;
