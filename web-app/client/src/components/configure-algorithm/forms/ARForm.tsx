import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControlledNumberSlider } from '@components/common/uikit/Inputs/NumberSlider';
import { ControlledSelect } from '@components/common/uikit/Inputs/Select';
import { ARoptions } from '@constants/options';
import { ARPresets } from '@constants/presets/ARPresets';
import { FormComponent } from 'types/form';

export type ARFormInputs = {
  algorithmName: string;
  minConfidence: number;
  minSupportAR: number;
};

const ARForm: FormComponent<ARFormInputs> = ({ setPresets }) => {
  const methods = useFormContext<ARFormInputs>();

  useEffect(() => {
    setPresets(ARPresets);
  }, [setPresets]);

  return (
    <>
      <ControlledSelect
        label="Algorithm"
        controlName="algorithmName"
        control={methods.control}
        options={ARoptions}
      />
      <ControlledNumberSlider
        label="Minimum confidence"
        controlName="minConfidence"
        control={methods.control}
        sliderProps={{ min: 0, max: 1, step: 1e-4 }}
        size={5}
      />
      <ControlledNumberSlider
        label="Minimum support"
        controlName="minSupportAR"
        control={methods.control}
        sliderProps={{ min: 0, max: 1, step: 1e-4 }}
        size={5}
      />
    </>
  );
};

ARForm.onSubmit = (fieldValues) => fieldValues;

export default ARForm;
