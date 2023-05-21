import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Text } from '@components/Inputs';
import { FormCheckboxProps } from 'types/form';

type TextProps = {
  field: ControllerRenderProps;
  props: FormCheckboxProps;
};

const FormText = ({ field: { ref }, props }: TextProps) => {
  return <Text ref={ref} {...props} />;
};

export default FormText;
