import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Radio } from '@components/Inputs';
import { FormRadioProps } from 'types/form';

type RadioProps = {
  field: ControllerRenderProps;
  props: FormRadioProps;
};

const FormRadio = ({ field: { ref }, props }: RadioProps) => {
  return <Radio ref={ref} {...props} />;
};

export default FormRadio;
