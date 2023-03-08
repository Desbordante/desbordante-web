// React stuff
import React, { FC } from 'react';
// Form stuff
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from 'react-hook-form';
import { Control } from 'react-hook-form';
import { FieldPath } from 'react-hook-form/dist/types';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form/dist/types/form';
// Primitive types
import { MainPrimitiveType } from 'types/globalTypes';

// One field in the form
export type FormInput<FieldType extends FieldValues> = (props: {
  field: ControllerRenderProps<FieldType, FieldPath<FieldType>>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<FieldType>;
}) => React.ReactElement;

// Form with all the fields
export type FormFields<FieldType extends FieldValues> = Partial<
  Record<keyof FieldType, FormInput<FieldType>>
>;

// Form logic and all fields
export type FormProps<FieldType extends FieldValues> = {
  control: Control;
  watch: UseFormWatch<FieldType>;
  setValue: UseFormSetValue<FieldType>;
  fileID: string;
};

// Form primitive type, form logic and fields and default values
export type FormConfig<FormProps, FieldType extends FieldValues> = {
  primitiveType: MainPrimitiveType | null;
  form: FC<FormProps>;
  formDefaults: FieldType;
};
