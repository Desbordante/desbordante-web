import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { DateTime, NumberRange } from '@components/Inputs';
import ListPropertiesModal from '@components/ListPropertiesModal';
import { Filters } from '../../Tasks';
import styles from './FiltersModal.module.scss';

interface Props {
  onClose: () => void;
  onApply: () => void;
}

const FilterModal: FC<Props> = ({ onClose, onApply }) => {
  const { control } = useFormContext<Filters>();

  return (
    <ListPropertiesModal
      name="Filters"
      onClose={onClose}
      onApply={() => {
        onApply();
        onClose();
      }}
    >
      <Controller
        control={control}
        name="elapsedTime"
        render={({ field: { value, onChange } }) => (
          <NumberRange
            label="Elapsed time (seconds)"
            size={5}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="period"
        render={({ field: { value, onChange } }) => (
          <DateTime
            label="Period"
            value={value}
            onChange={onChange}
            className={styles.periodInput}
          />
        )}
      />
    </ListPropertiesModal>
  );
};

export default FilterModal;
