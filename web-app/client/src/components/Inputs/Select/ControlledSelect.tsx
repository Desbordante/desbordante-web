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
const ControlledSelect = <T extends FieldValues>({
  controlName,
  control,
  rules,
  ...rest
}: SelectProps & ControlProps<T>) => (
  <Controller
    name={controlName}
    control={control}
    rules={rules}
    render={({ field }) => (
      <Select
        {...field}
        onChange={(option: any) => field.onChange(option?.value)}
        value={rest.options?.find((e: any) => e?.value === field.value)}
        {...rest}
      />
    )}
  />
);

export default ControlledSelect;
