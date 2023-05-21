import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { NumberSlider } from '@components/Inputs';
import { FormNumberSliderProps } from 'types/form';

type NumberSliderProps = {
  field: ControllerRenderProps;
  props: FormNumberSliderProps;
};

const FormNumberSlider = ({
  field,
  props: { size, min, max, step, ...props },
}: NumberSliderProps) => {
  return (
    <NumberSlider
      {...field}
      size={size}
      sliderProps={{ min, max, step }}
      {...props}
    />
  );
};

export default FormNumberSlider;
