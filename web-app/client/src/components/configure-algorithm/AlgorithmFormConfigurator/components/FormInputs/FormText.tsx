import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Text } from '@components/common/uikit/Inputs';
import { FormCheckboxProps } from 'types/form';

type TextProps = {
  field: ControllerRenderProps;
  props: FormCheckboxProps;
};

const FormText = ({ field: { ref }, props }: TextProps) => {
  return (
    <Text
      ref={ref}
      disabled={props.disabled}
      {..._.omit(props, ['rules', 'disabled'])}
    />
  );
};

export default FormText;
