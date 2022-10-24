import Button from '@components/Button';
import PopupWindowContainer from '@components/PopupWindowContainer';
import React, { FC } from 'react';
import _ from 'lodash';
import { OrderBy, PrimitiveType } from 'types/globalTypes';
import { OrderingTitles } from '@constants/titles';
import { useForm, useFormContext } from 'react-hook-form';
import { ControlledSelect } from '@components/Inputs/Select';
import { FiltersFields } from './Filters';
import styles from './Filters.module.scss';

type OrderingProps = {
  setIsOrderingShown: (arg: boolean) => void;
  primitive: PrimitiveType;
};

export const OrderingWindow: FC<OrderingProps> = ({
  setIsOrderingShown,
  primitive,
}) => {
  const baseForm = useFormContext();

  const orderingForm = useForm<Partial<FiltersFields>>({
    defaultValues: {
      ordering: baseForm.watch('ordering'),
      direction: baseForm.watch('direction'),
    },
  });

  const { ordering, direction } = orderingForm.watch();

  const orderingOptions = _.mapValues(
    OrderingTitles[primitive],
    (k: string, v: string) => ({
      label: k,
      value: v,
    })
  );

  const directionOptions = {
    [OrderBy.ASC]: { value: OrderBy.ASC, label: 'Ascending' },
    [OrderBy.DESC]: { value: OrderBy.DESC, label: 'Descending' },
  };

  const Select = ControlledSelect(orderingForm.control);

  return (
    <>
      <PopupWindowContainer onOutsideClick={() => setIsOrderingShown(false)}>
        <div className={styles.container}>
          <h4>Choose ordering</h4>
          <Select
            controlName="ordering"
            label="Order by"
            options={_.values(orderingOptions)}
          />

          <Select
            controlName="direction"
            label="Direction"
            options={_.values(directionOptions)}
          />

          <div className={styles.footer}>
            <Button
              variant="secondary"
              onClick={() => {
                orderingForm.reset();
                setIsOrderingShown(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                baseForm.setValue('ordering', ordering);
                baseForm.setValue('direction', direction);
                setIsOrderingShown(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopupWindowContainer>
    </>
  );
};
export default OrderingWindow;
