import _ from 'lodash';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { NumberSlider } from '@components/Inputs';
import { FormNumberSliderProps } from 'types/form';

type NumberSliderProps = {
  field: ControllerRenderProps;
  props: FormNumberSliderProps;
};

const FormNumberSlider = ({
  field,
  props: {
    numberSliderProps: { size, min, max, step },
    ...props
  },
}: NumberSliderProps) => {
  return (
    <NumberSlider
      {...field}
      size={size}
      sliderProps={{ min, max, step }}
      disabled={props.disabled}
      {..._.omit(props, ['rules', 'disabled'])}
    />
  );
};

export default FormNumberSlider;
