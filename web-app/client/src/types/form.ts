import { FC } from 'react';
import { FieldValues } from 'react-hook-form';

export type FormData = FieldValues & {
  algorithmName: string;
};

export type Preset<FormInputs = FieldValues> = {
  name: string;
  displayName: string;
  preset: Partial<FormInputs>;
};

export type DefaultPreset<FormInputs = FieldValues> = Preset<FormInputs> & {
  name: 'default';
  preset: FormInputs;
};

export type CommonPresets<FormInputs = FieldValues> = [
  ...Preset<FormInputs>[],
  DefaultPreset<FormInputs>,
];

export type FileName = string;

export type Presets<FormInputs = FieldValues> = {
  common: CommonPresets<FormInputs>;
  fileSpecific?: {
    fileNames: [FileName, ...FileName[]];
    presets: Preset<FormInputs>[];
  }[];
};

export type FormProps<FormInputs = FieldValues> = {
  fileID: string;
  setPresets: (presets: Presets<FormInputs>) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormComponent<FormInputs = any> = FC<FormProps<FormInputs>> & {
  onSubmit: (data: FormInputs) => FormData;
};
