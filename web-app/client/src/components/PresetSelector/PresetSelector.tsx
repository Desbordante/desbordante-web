import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Select } from '@components/Inputs';
import { FormObjectsType } from '@constants/formPrimitives';
import { OptionWithBadges } from 'types/multiSelect';

type PresetSelectorProps = {
  presets: FormObjectsType['formPresets'];
  isCustom: boolean;
  changePreset: (presetName: number) => void;
  isLoading: boolean;
};

const CUSTOM_PRESET_INDEX = -1;
const DEFAULT_PRESET_INDEX = -2;
export { CUSTOM_PRESET_INDEX, DEFAULT_PRESET_INDEX };

const PresetSelector = ({
  presets,
  isCustom,
  changePreset,
  isLoading,
}: PresetSelectorProps) => {
  const { control, setValue } = useForm({
    defaultValues: { presetIndex: DEFAULT_PRESET_INDEX },
  });

  const presetNameWatch = useWatch({
    control,
    name: 'presetIndex',
  });

  const presetOptions = useMemo(
    () =>
      presets
        .map((elem, index) => ({
          label: elem.presetName,
          value: index,
        }))
        .concat([
          { label: 'Custom', value: CUSTOM_PRESET_INDEX },
          { label: 'Default', value: DEFAULT_PRESET_INDEX },
        ]),
    [presets],
  );

  useEffect(() => {
    if (!isLoading)
      setValue('presetIndex', presets.length ? 0 : DEFAULT_PRESET_INDEX);
  }, [isLoading, presets.length, setValue]);

  useEffect(() => {
    changePreset(presetNameWatch);
  }, [changePreset, presetNameWatch]);

  useEffect(() => {
    if (isCustom) setValue('presetIndex', CUSTOM_PRESET_INDEX);
  }, [isCustom, setValue]);

  return (
    <Controller
      name={'presetIndex'}
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
