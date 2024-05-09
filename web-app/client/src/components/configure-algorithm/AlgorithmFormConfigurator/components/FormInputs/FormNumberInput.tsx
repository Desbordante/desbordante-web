import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { NumberInput } from '@components/common/uikit/Inputs';
import { FormNumberInputProps } from 'types/form';

type NumberInputProps = {
  field: ControllerRenderProps;
  props: FormNumberInputProps;
};

const FormNumberInput = ({
  field,
  props: { numberInputProps, ...props },
}: NumberInputProps) => {
  return (
    <NumberInput
      {...field}
      numberProps={numberInputProps}
      disabled={props.disabled}
      {..._.omit(props, ['rules', 'disabled'])}
    />
  );
};

export default FormNumberInput;
