import { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import MultiSelect, { MultiSelectProps as SelectProps } from './MultiSelect';

type ControlRules<T extends FieldValues> = ComponentProps<
  typeof Controller<T>
>['rules'];

type ControlProps<T extends FieldValues> = {
  controlName: Path<T>;
  control: Control<T>;
  rules?: ControlRules<T>;
};

const getSelectValues: (
  opt: ReadonlyArray<{ label: string; value: number }>,
) => number[] = (opt) => {
  return opt.map((element) => element.value);
};

const getSelectOptions: (
  options: ReadonlyArray<{ label: string; value: number }>,
  value: ReadonlyArray<number>,
) => ReadonlyArray<{ label: string; value: number }> = (options, values) => {
  return options.filter(({ value }) => values.includes(value));
};

const ControlledMultiSelect = <T extends FieldValues>({
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
      <MultiSelect
        {...field}
        onChange={(newValue) =>
          field.onChange(
            getSelectValues(newValue as { label: string; value: number }[]),
          )
        }
        value={getSelectOptions(
          rest.options as ReadonlyArray<{ label: string; value: number }>,
          field.value,
        )}
        {...rest}
      />
    )}
  />
);

export default ControlledMultiSelect;
