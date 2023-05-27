import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { NumberInput } from '@components/Inputs';
import { FormNumberInputProps } from 'types/form';

type NumberInputProps = {
  field: ControllerRenderProps;
  props: FormNumberInputProps;
};

const FormNumberInput = ({
  field,
  props: {
    numberInputProps: {
      defaultNum,
      min,
      includingMin,
      max,
      includingMax,
      numbersAfterDot,
    },
    ...props
  },
}: NumberInputProps) => {
  return (
    <NumberInput
      {...field}
      numberProps={{
        defaultNum,
        min,
        includingMin,
        max,
        includingMax,
        numbersAfterDot,
      }}
      {...props}
    />
  );
};

export default FormNumberInput;
