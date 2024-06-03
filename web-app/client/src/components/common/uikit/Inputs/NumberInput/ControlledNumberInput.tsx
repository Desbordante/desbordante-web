import { Controller, FieldValues } from 'react-hook-form';
import { ControlProps } from 'types/controlledInputs';
import NumberInput, { Props as NumberInputProps } from './NumberInput';

const ControlledNumberInput = <T extends FieldValues>({
  controlName,
  control,
  rules,
  numberProps,
  ...rest
}: Omit<NumberInputProps, 'value' | 'onChange' | 'onBlue' | 'name' | 'ref'> &
  ControlProps<T>) => (
  <Controller
    name={controlName}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => (
      <NumberInput
        {...field}
        error={fieldState.error?.message}
        numberProps={numberProps}
        {...rest}
      />
    )}
  />
);

export default ControlledNumberInput;
