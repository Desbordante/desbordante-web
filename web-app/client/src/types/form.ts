import React, { FC, ReactElement } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  ControllerRenderProps,
  UseControllerProps,
} from 'react-hook-form/dist/types/controller';
import { Path } from 'react-hook-form/dist/types/path/eager';
import { OptionWithBadges } from 'types/multiSelect';
export type FormValueType = string | string[] | number | number[] | boolean;

export type Defaults = Record<string, FormValueType>;

export type FormFieldProps<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>
> = {
  order: number;
  type: string;
  label: string;
  tooltip?: string;
  error?: string;
  disabled?: boolean;
  rules?: UseControllerProps<TDefaultValues, TName>['rules'];
};

// Field with custom inner component
export type FormCustomProps<
  TDefaultValues extends Defaults,
  TName extends Path<TDefaultValues>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TAdditionalProps = Record<string, any>
> = FormFieldProps<TDefaultValues, TName> &
  TAdditionalProps & {
    type: 'custom';

    component: FC<FormFieldProps<TDefaultValues, TName> & TAdditionalProps>;
  };

export type FormSelectOptions = OptionWithBadges[];

export const ArrayToOptions: (options: string[]) => OptionWithBadges[] = (
  options
) => {
  return options.map((option) => ({ label: option, value: option }));
};

// Field with select
export type FormSelectProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'select';

  options: FormSelectOptions;
  isLoading?: boolean;
};

// Field with multiple select
export type FormMultiSelectProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'multi_select';

  options: FormSelectOptions;
  isLoading?: boolean;
};

// Field with number slider
export type FormNumberSliderProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'number_slider';

  size?: number;

  min: number;
  max: number;
  step: number;
};

// Field with number input
export type FormNumberInputProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'number_input';

  defaultNum: number;
  min?: number;
  includingMin?: boolean;
  max?: number;
  includingMax?: boolean;
  numbersAfterDot?: number;
};

// Field with checkbox
export type FormCheckboxProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'checkbox';

  variant?: 'outline' | 'simple'; // change for union type ???
};

// Field with radio
export type FormRadioProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'radio';
};

// Field with text
export type FormTextProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> = FormFieldProps<TDefaultValues, TName> & {
  type: 'text';
};

export type FormInputProps<
  TDefaultValues extends Defaults = Defaults,
  TName extends Path<TDefaultValues> = Path<TDefaultValues>
> =
  //Add new fields here \/ \/ \/
  | FormSelectProps<TDefaultValues, TName>
  | FormMultiSelectProps<TDefaultValues, TName>
  | FormNumberSliderProps<TDefaultValues, TName>
  | FormNumberInputProps<TDefaultValues, TName>
  | FormCheckboxProps<TDefaultValues, TName>
  | FormRadioProps<TDefaultValues, TName>
  | FormTextProps<TDefaultValues, TName>
  | FormCustomProps<TDefaultValues, TName>;

export type FormFieldPropsType = FormInputProps['type'];

type TypeToFormFieldType<T> = T extends string
  ? 'text' | 'select' | 'custom'
  : T extends number
  ? 'number_input' | 'number_slider' | 'custom'
  : T extends boolean
  ? 'checkbox' | 'radio' | 'custom'
  : T extends string[]
  ? 'multi_select' | 'custom'
  : T extends number[]
  ? 'custom'
  : never;

export type FormFieldsProps<TFields extends Defaults> = {
  [Key in keyof TFields]: Extract<
    FormInputProps,
    { type: TypeToFormFieldType<TFields[Key]> }
  >;
};

export type FormHook<
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>
> = (
  fileID: string,
  form: TFormFields,
  setForm: React.Dispatch<React.SetStateAction<TFormFields>>,
  methods: UseFormReturn<TFields>
) => void;

export type FormLogic<
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>
> = (form: TFormFields, methods: UseFormReturn<TFields>) => TFormFields;

export type FormProcessor<
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>
> = {
  formLogic: FormLogic<TFields, TFormFields>;
  deps: (keyof TFields)[];
};

export const CreateFormProcessor: <
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>
>(
  formLogic: FormLogic<TFields, TFormFields>,
  deps: (keyof TFields)[]
) => FormProcessor<TFields, TFormFields> = (formLogic, deps) => {
  return {
    formLogic,
    deps,
  };
};

export type Form<
  TFields extends Defaults = Defaults,
  TFormFields extends FormFieldsProps<TFields> = FormFieldsProps<TFields>
> = {
  formDefaults: TFields;
  formFields: TFormFields;
  useFormHook: FormHook<TFields, TFormFields>;
  formProcessor: FormProcessor<TFields, TFormFields>;
};

export const CreateForm: <
  TFields extends Defaults,
  TFormFields extends FormFieldsProps<TFields>
>(
  formDefaults: TFields,
  formFields: TFormFields,
  useFormHook?: FormHook<TFields, TFormFields>,
  formProcessor?: FormProcessor<TFields, TFormFields>
) => Form<TFields, TFormFields> = (
  formDefaults, // TODO: change to dictionary of defaults where is key is a uuid of a file and value is defaults
  formFields,
  useFormHook = undefined,
  formProcessor = undefined
) => {
  return {
    formDefaults,
    formFields,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    useFormHook: useFormHook || (() => {}),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    formProcessor: formProcessor || {
      formLogic: (form) => {
        return form;
      },
      deps: [],
    },
  };
};

export type FieldControllerRenderProps<TFieldValues extends Defaults> =
  ControllerRenderProps<TFieldValues>;
export type FormInputElementProps<TFieldValues extends Defaults> = {
  field: FieldControllerRenderProps<TFieldValues>;
  props: FormInputProps;
};
export type FormInputElement<TFieldValues extends Defaults> = (
  props: FormInputElementProps<TFieldValues>
) => ReactElement;
