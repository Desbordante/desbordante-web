import _ from 'lodash';
import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@components/Inputs';
import PopupWindowContainer from '@components/PopupWindowContainer';
import styles from './Filters.module.scss';

type FilteringProps = {
  setIsFilteringShown: (arg: boolean) => void;
};

export const FilteringWindow: FC<FilteringProps> = ({
  setIsFilteringShown,
}) => {
  const { watch, setValue } = useFormContext();
  const showKeys = watch('showKeys');

  return (
    <>
      <PopupWindowContainer onOutsideClick={() => setIsFilteringShown(false)}>
        <div className={styles.container}>
          <h5>Choose filters</h5>
          <Checkbox
            label="Show dependencies containing keys"
            checked={showKeys}
            onChange={() => setValue('showKeys', !showKeys)}
          />
        </div>
      </PopupWindowContainer>
    </>
  );
};

export default FilteringWindow;
