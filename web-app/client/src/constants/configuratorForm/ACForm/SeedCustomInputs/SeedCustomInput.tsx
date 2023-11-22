import Button from '@components/Button';
import styles from './SeedCustomInput.module.scss';
import { NumberInput } from '@components/Inputs';
import {
  FormCustomProps,
  FormFieldProps,
  FormNumberInputProps,
} from 'types/form';
import {
  BaseSyntheticEvent,
  FC,
  ForwardRefRenderFunction,
  forwardRef,
} from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { ACDefaults } from '../index';

//Omit<FormFieldProps<Defaults, string>, "rules"> & Record<string, any> & ControllerRenderProps<Defaults>

type Props = Omit<FormCustomProps<typeof ACDefaults, 'seed'>, 'rules'> &
  ControllerRenderProps<typeof ACDefaults, 'seed'>;

const SeedCustomInput: ForwardRefRenderFunction<HTMLInputElement, Props> = (
  props,
  ref,
) => {
  const handlerRandomSeed = () => {
    const newSeed = Math.round(Math.random() * 999_999);
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
