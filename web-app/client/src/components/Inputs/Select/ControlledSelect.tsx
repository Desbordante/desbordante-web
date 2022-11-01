import { Control, Controller } from 'react-hook-form';
import Select, { Props } from './Select';

type ControlProps = {
  controlName: string;
  control: Control;
};
const ControlledSelect = ({
  controlName,
  control,
  ...rest
}: Props & ControlProps) => (
  <Controller
    name={controlName}
    control={control}
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
