import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ControlledNumberSlider } from '@components/common/uikit/Inputs/NumberSlider';
import { ControlledSelect } from '@components/common/uikit/Inputs/Select';
import {
  AlgoProps,
  Algorithms,
  FDoptions,
  optionsByAlgorithms,
} from '@constants/options';
import { FDPresets } from '@constants/presets/FDPresets';
import { FormComponent } from 'types/form';

export type FDFormInputs = {
  algorithmName: string;
  errorThreshold: number;
  maxLHS: number;
  threadsCount: number;
};

const FDForm: FormComponent<FDFormInputs> = ({ setPresets }) => {
  const methods = useFormContext<FDFormInputs>();

  const [algorithmName] = useWatch({
    name: ['algorithmName'],
  });

  const [options, setOptions] = useState<AlgoProps[]>([]);

  useEffect(() => {
    setPresets(FDPresets);
  }, [setPresets]);

  useEffect(() => {
    setOptions(optionsByAlgorithms[algorithmName as Algorithms]);
  }, [algorithmName]);

  return (
    <>
      <ControlledSelect
        label="Algorithm"
        controlName="algorithmName"
        control={methods.control}
        options={FDoptions}
      />
      <ControlledNumberSlider
        label="Error threshold"
        controlName="errorThreshold"
        control={methods.control}
        disabled={!options?.includes('threshold')}
        sliderProps={{ min: 0, max: 1, step: 1e-4 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Arity constraint"
        controlName="maxLHS"
        control={methods.control}
        disabled={!options?.includes('arity')}
        sliderProps={{ min: 1, max: 10, step: 1 }}
        size={4}
      />
      <ControlledNumberSlider
        label="Thread count"
        controlName="threadsCount"
        control={methods.control}
        disabled={!options?.includes('threads')}
        sliderProps={{ min: 1, max: 8, step: 1 }}
        size={4}
      />
    </>
  );
};

FDForm.onSubmit = (fieldValues) => fieldValues;

export default FDForm;
