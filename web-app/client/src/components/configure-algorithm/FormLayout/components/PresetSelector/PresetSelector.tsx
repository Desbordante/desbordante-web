import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch, FieldValues } from 'react-hook-form';
import { Select } from '@components/common/uikit/Inputs';
import { Presets } from '@components/configure-algorithm/types/form';
import {
  getFileName,
  getFileNameVariables,
} from '@graphql/operations/queries/__generated__/getFileName';
import { GET_FILE_NAME } from '@graphql/operations/queries/getFileName';
import { showError } from '@utils/toasts';
import { OptionWithBadges } from 'types/multiSelect';

type PresetSelectorProps = {
  fileID: string;
  isCustom: boolean;
  formReset: (preset: FieldValues) => void;
  formTrigger: () => void;
  presets: Presets | undefined;
};

const CUSTOM_PRESET_INDEX = -1;
export { CUSTOM_PRESET_INDEX };

const PresetSelector = ({
  fileID,
  isCustom,
  formReset,
  formTrigger,
  presets,
}: PresetSelectorProps) => {
  const { control, setValue } = useForm<{ presetIndex?: number }>();

  const presetNameWatch = useWatch({
    control,
    name: 'presetIndex',
  });

  const { loading: isLoading, data: fileNameData } = useQuery<
    getFileName,
    getFileNameVariables
  >(GET_FILE_NAME, {
    variables: { fileID },
    onError: (error) => {
      showError(
        error.message,
        "Can't fetch file information. Please try later.",
      );
    },
  });

  const defaultPreset = useMemo(
    () => presets?.common?.at(-1)?.preset ?? {},
    [presets],
  );

  const fromPresets = useMemo(() => {
    if (isLoading) {
      return [];
    }

    if (presets === undefined) {
      return [];
    }

    if (
      presets.fileSpecific === undefined ||
      fileNameData?.datasetInfo?.fileName === undefined
    ) {
      return presets.common;
    }

    const fileName = fileNameData?.datasetInfo?.fileName;

    const fileSpecificPresets = presets.fileSpecific
      .filter((preset) => preset.fileNames.includes(fileName))
      .map((entry) => entry.presets)
      .flat();

    return [...fileSpecificPresets, ...presets.common];
  }, [isLoading, presets, fileNameData]);

  const presetOptions = useMemo(
    () =>
      fromPresets
        .map((preset, index) => ({
          label: preset.displayName,
          value: index,
        }))
        .concat([{ label: 'Custom', value: CUSTOM_PRESET_INDEX }]),
    [fromPresets],
  );

  useEffect(() => {
    if (!isLoading) {
      if (presetOptions.length > 0) {
        setValue('presetIndex', 0);
      } else {
        setValue('presetIndex', CUSTOM_PRESET_INDEX);
      }
    }
  }, [isLoading, presetOptions, setValue]);

  const [needTrigger, setNeedTrigger] = useState(false);

  useEffect(() => {
    if (needTrigger) {
      setNeedTrigger(false);
      formTrigger();
    }
  }, [formTrigger, needTrigger]);

  const changePreset = useCallback(
    (presetIndex: number | undefined) => {
      if (presetIndex !== undefined && presetIndex !== CUSTOM_PRESET_INDEX) {
        formReset({
          ...defaultPreset,
          ...fromPresets[presetIndex].preset,
        });
        setNeedTrigger(true);
      }
    },
    [defaultPreset, formReset, fromPresets],
  );

  useEffect(() => {
    changePreset(presetNameWatch);
  }, [changePreset, presetNameWatch]);

  useEffect(() => {
    if (isCustom) {
      setValue('presetIndex', CUSTOM_PRESET_INDEX);
    }
  }, [isCustom, setValue]);

  return (
    <Controller
      name="presetIndex"
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
