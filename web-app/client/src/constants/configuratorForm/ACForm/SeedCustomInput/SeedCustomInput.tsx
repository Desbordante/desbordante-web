import Button from '@components/Button';
import { NumberInput } from '@components/Inputs';
import { ForwardRefRenderFunction, forwardRef } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { FormCustomProps } from 'types/form';
import { ACDefaults } from '../index';
import styles from './SeedCustomInput.module.scss';

type Props = Omit<FormCustomProps<typeof ACDefaults, 'seed'>, 'rules'> &
  ControllerRenderProps<typeof ACDefaults, 'seed'>;

const SeedCustomInput: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  props,
  ref,
) => {
  const handlerRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    props.onChange(newSeed);
  };
  return (
    <div className={styles.seedCustomInput}>
      <NumberInput className={styles.input} {...props} ref={ref} />
      <Button variant="secondary" onClick={handlerRandomSeed}>
        Random
      </Button>
    </div>
  );
};

export default forwardRef(SeedCustomInput);
