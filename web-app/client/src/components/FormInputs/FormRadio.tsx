import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { Radio } from '@components/Inputs';
import { FormRadioProps } from 'types/form';

type RadioProps = {
  field: ControllerRenderProps;
  props: FormRadioProps;
};

const FormRadio = ({
  field: { ref },
  props: { innerName, ...props },
}: RadioProps) => {
  return (
    <Radio
      ref={ref}
      name={innerName}
      disabled={props.disabled}
      {..._.omit(props, ['rules', 'disabled'])}
    />
  );
};

export default FormRadio;
