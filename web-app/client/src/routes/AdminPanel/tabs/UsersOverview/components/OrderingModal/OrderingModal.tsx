import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Select } from '@components/Inputs';
import ListPropertiesModal from '@components/ListPropertiesModal';
import { OrderDirection, UsersQueryOrderingParameter } from 'types/globalTypes';
import { Ordering } from '../../UsersOverview';

const parameterLabels: Record<UsersQueryOrderingParameter, string> = {
  CREATION_TIME: 'Created',
  STATUS: 'Status',
  COUNTRY: 'Country',
  FULL_NAME: 'Full name',
};

const directionLabels: Record<OrderDirection, string> = {
  ASC: 'Ascending',
  DESC: 'Descending',
};

const parameterOptions = Object.entries(parameterLabels).map(
  ([value, label]) => ({ label, value }),
);

const directionOptions = Object.entries(directionLabels).map(
  ([value, label]) => ({ label, value }),
);

interface Props {
  onClose: () => void;
  onApply: () => void;
}

const OrderingModal: FC<Props> = ({ onClose, onApply }) => {
  const { control } = useFormContext<Ordering>();

  return (
    <ListPropertiesModal
      name="Ordering"
      onClose={onClose}
      onApply={() => {
        onApply();
        onClose();
      }}
    >
      <Controller
        control={control}
        name="parameter"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Order by"
            value={parameterOptions.find((option) => option.value === value)}
            onChange={(option) => onChange(option?.value)}
            options={parameterOptions}
          />
        )}
      />
      <Controller
        control={control}
        name="direction"
        render={({ field: { value, onChange } }) => (
          <Select
            label="Direction"
            value={directionOptions.find((option) => option.value === value)}
            onChange={(option) => onChange(option?.value)}
            options={directionOptions}
          />
        )}
      />
    </ListPropertiesModal>
  );
};

export default OrderingModal;
