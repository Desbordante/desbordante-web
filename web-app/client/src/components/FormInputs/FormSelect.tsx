import _ from 'lodash';
import { ReactElement, ForwardRefRenderFunction, forwardRef } from 'react';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { InputPropsBase, Select } from '@components/Inputs';
import { FormInputElement, FormSelectProps } from 'types/form';
import { OptionWithBadges } from 'types/multiSelect';

// export type Props = ControllerRenderProps & FormSelectProps;
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
