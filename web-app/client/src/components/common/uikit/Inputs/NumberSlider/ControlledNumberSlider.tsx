import { Controller, FieldValues } from 'react-hook-form';
import { ControlProps } from 'types/controlledInputs';
import NumberSlider, { Props as NumberSliderProps } from './NumberSlider';

const ControlledNumberSlider = <T extends FieldValues>({
  controlName,
  control,
  rules,
  sliderProps,
  ...rest
}: Omit<NumberSliderProps, 'value' | 'onChange' | 'onBlue' | 'name' | 'ref'> &
  ControlProps<T>) => (
  <Controller
    name={controlName}
    control={control}
    rules={rules}
    render={({ field, fieldState }) => (
      <NumberSlider
        {...field}
        error={fieldState.error?.message}
        sliderProps={sliderProps}
        {...rest}
      />
    )}
  />
);

export default ControlledNumberSlider;
