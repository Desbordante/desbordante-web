import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Select } from '@components/Inputs';
import { FormSelectProps } from 'types/form';
import { OptionWithBadges } from 'types/multiSelect';

type SelectProps = {
  field: ControllerRenderProps;
  props: FormSelectProps;
};

const FormSelect = ({
  field: { onChange, value, ...field },
  props,
}: SelectProps) => {
  return (
    <Select
      {...field}
      {..._.omit(props, 'rules')}
      value={props.options.find((option) => option.value === value)}
      onChange={(e) => onChange((e as OptionWithBadges).value)}
    />
  );
};

export default FormSelect;
