import { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Option } from 'types/inputs';
import MultiSelect, { MultiSelectProps } from './MultiSelect';

type ControlRules<T extends FieldValues> = ComponentProps<
  typeof Controller<T>
>['rules'];

type ControlProps<T extends FieldValues> = {
  controlName: Path<T>;
  control: Control<T>;
  rules?: ControlRules<T>;
};

const getSelectValues: <TValue = string>(
  opt: ReadonlyArray<Option<TValue>>,
) => TValue[] = (opt) => {
  return opt.map((element) => element.value);
};

const getSelectOptions: <TValue = string>(
  options: ReadonlyArray<Option<TValue>> | undefined,
  value: TValue[],
) => ReadonlyArray<Option<TValue>> | undefined = (options, values) => {
  return options?.filter(({ value }) => values.includes(value));
};

const ControlledMultiSelect = <T extends FieldValues, TValue = string>({
  controlName,
  control,
  rules,
  ...rest
}: MultiSelectProps<TValue> & ControlProps<T>) => (
  <Controller
    name={controlName}
    control={control}
    rules={rules}
    render={({ field }) => (
      <MultiSelect<TValue>
        {...field}
        onChange={(newValue) => field.onChange(getSelectValues(newValue))}
        value={getSelectOptions(rest.options, field.value)}
        {...rest}
      />
    )}
  />
);

export default ControlledMultiSelect;
