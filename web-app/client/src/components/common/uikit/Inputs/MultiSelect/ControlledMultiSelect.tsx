import { Controller, FieldValues } from 'react-hook-form';
import { ControlProps } from 'types/controlledInputs';
import { Option } from 'types/inputs';
import MultiSelect, { MultiSelectProps } from './MultiSelect';

const getSelectValues: <TValue = string>(
  opt: ReadonlyArray<Option<TValue>>,
) => TValue[] = (opt) => {
  return opt.map((element) => element.value);
};

const getSelectOptions: <TValue = string>(
  options: ReadonlyArray<Option<TValue>> | undefined,
  value: TValue[] | undefined,
) => ReadonlyArray<Option<TValue>> | undefined = (options, values) => {
  return options?.filter(({ value }) => values?.includes(value));
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
    render={({ field, fieldState }) => (
      <MultiSelect<TValue>
        {...field}
        error={fieldState.error?.message}
        onChange={(newValue) => field.onChange(getSelectValues(newValue))}
        value={getSelectOptions(rest.options, field.value)}
        {...rest}
      />
    )}
  />
);

export default ControlledMultiSelect;
