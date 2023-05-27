import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Checkbox } from '@components/Inputs';
import { FormCheckboxProps } from 'types/form';

type CheckboxProps = {
  field: ControllerRenderProps;
  props: FormCheckboxProps;
};

const FormCheckbox = ({ field: { ref }, props }: CheckboxProps) => {
  return (
    <Checkbox
      ref={ref}
      disabled={props.disabled}
      {..._.omit(props, ['rules', 'disabled'])}
    />
  );
};

export default FormCheckbox;
