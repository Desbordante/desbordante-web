import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Select } from '@components/Inputs';
import { OptionWithBadges } from 'types/multiSelect';

type PresetSelectorProps = {
  presetOptions: OptionWithBadges[];
  isCustom: boolean;
  changePreset: (presetName: number) => void;
  isLoading: boolean;
};

const PresetSelector = ({
  presetOptions,
  isCustom,
  changePreset,
  isLoading,
}: PresetSelectorProps) => {
  const { control, setValue } = useForm({
    defaultValues: { presetName: 0 },
  });

  const presetNameWatch = useWatch({
    control,
    name: 'presetName',
  });

  useEffect(() => {
    changePreset(presetNameWatch);
  }, [changePreset, presetNameWatch]);

  useEffect(() => {
    if (isCustom) setValue('presetName', -1);
  }, [isCustom, setValue]);

  return (
    <Controller
      name={'presetName'}
      control={control}
      render={({ field: { onChange, value, ...field } }) => (
        <Select
          {...field}
          value={presetOptions.find((option) => option.value === value)}
          onChange={(e) => onChange((e as OptionWithBadges).value)}
          label={'Preset'}
          options={presetOptions}
          filterOption={(option) => option.label !== 'Custom'}
          isLoading={isLoading}
        />
      )}
    />
  );
};

export default PresetSelector;
