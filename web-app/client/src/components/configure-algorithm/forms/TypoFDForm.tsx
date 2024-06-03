import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControlledNumberSlider } from '@components/common/uikit/Inputs/NumberSlider';
import { ControlledSelect } from '@components/common/uikit/Inputs/Select';
import { ApproxOptions, TypoOptions } from '@constants/options';
import { TypoFDPresets } from '@constants/presets/TypoFDPresets';
import { FormComponent } from '../types/form';

export type TypoFDFormInputs = {
  preciseAlgorithm: string;
  approximateAlgorithm: string;
  maxLHS: number;
  errorThreshold: number;
  threadsCount: number;
  defaultRadius: number;
  defaultRatio: number;
};

const TypoFDForm: FormComponent<TypoFDFormInputs> = ({ setPresets }) => {
  const methods = useFormContext<TypoFDFormInputs>();

  useEffect(() => {
    setPresets(TypoFDPresets);
  }, [setPresets]);

  return (
    <>
      <ControlledSelect
        label="Precise Algorithm"
        controlName="preciseAlgorithm"
        control={methods.control}
        options={TypoOptions}
      />
      <ControlledSelect
        label="Approximate Algorithm"
        controlName="approximateAlgorithm"
        control={methods.control}
        options={ApproxOptions}
      />
      <ControlledNumberSlider
        label="Error threshold"
        controlName="errorThreshold"
        control={methods.control}
        sliderProps={{ min: 0, max: 1, step: 1e-4 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Arity constraint"
        controlName="maxLHS"
        control={methods.control}
        sliderProps={{ min: 1, max: 9, step: 1 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Thread count"
        controlName="threadsCount"
        control={methods.control}
        sliderProps={{ min: 1, max: 8, step: 1 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Radius"
        controlName="defaultRadius"
        control={methods.control}
        sliderProps={{ min: 1, max: 10, step: 1e-4 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Ratio"
        controlName="defaultRatio"
        control={methods.control}
        sliderProps={{ min: 0, max: 1, step: 1e-2 }}
        size={4}
      />
    </>
  );
};

TypoFDForm.onSubmit = (fieldValues) => ({
  ...fieldValues,
  algorithmName: 'Typo Miner',
  metric: 'MODULUS_OF_DIFFERENCE',
});

export default TypoFDForm;
