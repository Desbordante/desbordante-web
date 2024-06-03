import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControlledNumberSlider } from '@components/common/uikit/Inputs/NumberSlider';
import { ControlledSelect } from '@components/common/uikit/Inputs/Select';
import { CFDoptions } from '@constants/options';
import { CFDPresets } from '@constants/presets/CFDPresets';
import { FormComponent } from '../types/form';

export type CFDFormInputs = {
  algorithmName: string;
  minConfidence: number;
  maxLHS: number;
  minSupportCFD: number;
};

const CFDForm: FormComponent<CFDFormInputs> = ({ setPresets }) => {
  const methods = useFormContext<CFDFormInputs>();

  useEffect(() => {
    setPresets(CFDPresets);
  }, [setPresets]);

  return (
    <>
      <ControlledSelect
        label="Algorithm"
        controlName="algorithmName"
        control={methods.control}
        options={CFDoptions}
      />
      <ControlledNumberSlider
        label="Minimum confidence"
        controlName="minConfidence"
        control={methods.control}
        sliderProps={{ min: 0, max: 1, step: 1e-4 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Minimum support"
        controlName="maxLHS"
        control={methods.control}
        sliderProps={{ min: 1, max: 10, step: 1 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Minimum support"
        controlName="minSupportCFD"
        control={methods.control}
        sliderProps={{ min: 1, max: 16, step: 1 }}
        size={4}
      />
    </>
  );
};

CFDForm.onSubmit = (fieldValues) => fieldValues;

export default CFDForm;
