import { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import Select, { Props as SelectProps } from './Select';

type ControlRules<T extends FieldValues> = ComponentProps<
  typeof Controller<T>
>['rules'];

type ControlProps<T extends FieldValues> = {
  controlName: Path<T>;
  control: Control<T>;
  rules?: ControlRules<T>;
};
const ControlledSelect = <T extends FieldValues, TValue = string>({
  controlName,
  control,
  rules,
  ...rest
}: SelectProps<TValue> & ControlProps<T>) => (
  <Controller
    name={controlName}
    control={control}
    rules={rules}
    render={({ field }) => (
      <Select<TValue>
        {...field}
        onChange={(option) => field.onChange(option?.value)}
        value={rest.options?.find((e) => e?.value === field.value)}
        {...rest}
      />
    )}
  />
);

export default ControlledSelect;
